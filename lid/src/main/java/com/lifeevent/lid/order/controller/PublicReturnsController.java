package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.CreateReturnRequestDto;
import com.lifeevent.lid.order.dto.PublicReturnOrderDto;
import com.lifeevent.lid.order.dto.PublicReturnOrderItemDto;
import com.lifeevent.lid.order.dto.ReturnItemRequestDto;
import com.lifeevent.lid.order.dto.ReturnRequestResponseDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/public/returns")
@RequiredArgsConstructor
public class PublicReturnsController {

    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;

    @GetMapping("/order/{orderNumber}")
    @Transactional(readOnly = true)
    public PublicReturnOrderDto getOrderForReturn(@PathVariable String orderNumber, @RequestParam String email) {
        String rawOrderNumber = orderNumber == null ? "" : orderNumber.trim();
        if (rawOrderNumber.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande requis");
        }

        Long orderId = tryExtractOrderId(rawOrderNumber);
        if (orderId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande invalide");
        }

        String normalizedEmail = normalizeEmail(email);
        validateEmail(normalizedEmail);

        Order order = orderRepository.findWithCustomerAndArticlesById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commande introuvable"));

        String expected = normalizeEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null);
        if (expected.isBlank() || !expected.equalsIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(NOT_FOUND, "Commande introuvable");
        }

        List<PublicReturnOrderItemDto> items = order.getArticles() == null ? List.of() : order.getArticles().stream()
                .filter(line -> line != null && line.getArticle() != null && line.getArticle().getId() != null)
                .map(line -> new PublicReturnOrderItemDto(
                        line.getArticle().getId(),
                        line.getArticle().getName(),
                        line.getQuantity(),
                        line.getPriceAtOrder(),
                        line.getArticle().getImg()
                ))
                .toList();

        return new PublicReturnOrderDto(
                order.getId(),
                "ORD-" + order.getId(),
                order.getAmount(),
                order.getCurrency(),
                items
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ReturnRequestResponseDto create(@Valid @RequestBody CreateReturnRequestDto request) {
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
            if (!unitPriceByArticle.containsKey(articleId)) {
                unitPriceByArticle.put(articleId, line.getPriceAtOrder());
            }
            if (!nameByArticle.containsKey(articleId)) {
                nameByArticle.put(articleId, line.getArticle().getName());
            }
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
