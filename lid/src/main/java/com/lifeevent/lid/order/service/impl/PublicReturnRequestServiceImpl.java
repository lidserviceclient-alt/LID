package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.backoffice.lid.notification.dto.CreateBackOfficeNotificationRequest;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import com.lifeevent.lid.backoffice.lid.notification.service.BackOfficeNotificationService;
import com.lifeevent.lid.order.dto.CreateReturnRequestDto;
import com.lifeevent.lid.order.dto.ReturnItemRequestDto;
import com.lifeevent.lid.order.dto.ReturnRequestResponseDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import com.lifeevent.lid.order.service.PublicReturnRequestService;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Transactional
public class PublicReturnRequestServiceImpl implements PublicReturnRequestService {

    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final BackOfficeNotificationService backOfficeNotificationService;

    @Override
    public ReturnRequestResponseDto create(CreateReturnRequestDto request) {
        String rawOrderNumber = request.orderNumber() == null ? "" : request.orderNumber().trim();
        if (rawOrderNumber.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande requis");
        }

        Long orderId = tryExtractOrderId(rawOrderNumber);
        if (orderId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande invalide");
        }

        Order order = orderRepository.findWithCustomerAndArticlesById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commande introuvable"));

        String email = normalizeEmail(request.email());
        validateEmail(email);
        String expected = normalizeEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null);
        if (expected.isBlank() || !expected.equalsIgnoreCase(email)) {
            throw new ResponseStatusException(NOT_FOUND, "Commande introuvable");
        }

        String reason = request.reason() == null ? "" : request.reason().trim();
        if (reason.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Motif requis");
        }

        List<ReturnItemRequestDto> requestedItems = normalizeItems(request.items());
        if (requestedItems.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Veuillez sélectionner au moins un produit");
        }

        if (order.getArticles() == null || order.getArticles().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Aucun article dans cette commande");
        }

        Map<Long, Integer> purchasedQtyByArticle = new LinkedHashMap<>();
        Map<Long, Double> unitPriceByArticle = new LinkedHashMap<>();
        Map<Long, String> nameByArticle = new LinkedHashMap<>();

        order.getArticles().forEach(line -> {
            if (line == null || line.getArticle() == null || line.getArticle().getId() == null) {
                return;
            }
            Long articleId = line.getArticle().getId();
            int qty = line.getQuantity() == null ? 0 : line.getQuantity();
            if (qty <= 0) {
                return;
            }
            purchasedQtyByArticle.merge(articleId, qty, Integer::sum);
            unitPriceByArticle.putIfAbsent(articleId, line.getPriceAtOrder());
            nameByArticle.putIfAbsent(articleId, line.getArticle().getName());
        });

        ReturnRequest rr = new ReturnRequest();
        rr.setOrderId(order.getId());
        rr.setOrderNumber("ORD-" + order.getId());
        rr.setEmail(email);
        rr.setReason(reason);
        rr.setDetails(trimToNull(request.details()));
        rr.setStatus(ReturnRequestStatus.SUBMITTED);

        List<ReturnRequestItem> items = new ArrayList<>();
        for (ReturnItemRequestDto it : requestedItems) {
            if (it == null || it.articleId() == null || it.quantity() == null) {
                continue;
            }
            int qty = it.quantity();
            if (qty <= 0) {
                continue;
            }
            int max = purchasedQtyByArticle.getOrDefault(it.articleId(), 0);
            if (max <= 0) {
                throw new ResponseStatusException(BAD_REQUEST, "Produit invalide pour cette commande");
            }
            if (qty > max) {
                throw new ResponseStatusException(BAD_REQUEST, "Quantité invalide (max " + max + ")");
            }
            ReturnRequestItem item = new ReturnRequestItem();
            item.setReturnRequest(rr);
            item.setArticleId(it.articleId());
            item.setArticleName(nameByArticle.getOrDefault(it.articleId(), "Article " + it.articleId()));
            item.setQuantity(qty);
            item.setUnitPrice(unitPriceByArticle.get(it.articleId()));
            items.add(item);
        }

        if (items.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Veuillez sélectionner au moins un produit");
        }

        rr.getItems().clear();
        rr.getItems().addAll(items);

        ReturnRequest saved = returnRequestRepository.save(rr);
        backOfficeNotificationService.create(CreateBackOfficeNotificationRequest.builder()
                .type(BackOfficeNotificationType.RETURN_REQUEST)
                .scope(BackOfficeNotificationScope.BACKOFFICE)
                .targetRole(BackOfficeNotificationTargetRole.ADMIN)
                .title("Nouvelle demande de retour")
                .body("Retour " + saved.getOrderNumber() + " soumis par " + saved.getEmail())
                .actionPath("/returns")
                .actionLabel("Ouvrir")
                .severity(BackOfficeNotificationSeverity.WARNING)
                .dedupeKey("RETURN_REQUEST:" + saved.getId())
                .payload(Map.of(
                        "returnRequestId", saved.getId(),
                        "orderNumber", saved.getOrderNumber(),
                        "email", saved.getEmail()
                ))
                .build());
        return new ReturnRequestResponseDto(saved.getId(), saved.getOrderNumber(), saved.getStatus(), saved.getCreatedAt());
    }

    private Long tryExtractOrderId(String orderNumber) {
        String digits = orderNumber.trim().replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String normalizeEmail(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private List<ReturnItemRequestDto> normalizeItems(List<ReturnItemRequestDto> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        Map<Long, Integer> out = new LinkedHashMap<>();
        for (ReturnItemRequestDto it : items) {
            if (it == null || it.articleId() == null || it.quantity() == null) {
                continue;
            }
            if (it.quantity() <= 0) {
                continue;
            }
            out.merge(it.articleId(), it.quantity(), Integer::sum);
        }
        return out.entrySet().stream().map(e -> new ReturnItemRequestDto(e.getKey(), e.getValue())).toList();
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email requis");
        }
        try {
            InternetAddress addr = new InternetAddress(email, true);
            addr.validate();
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Email invalide");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String s = value.trim();
        return s.isEmpty() ? null : s;
    }
}
