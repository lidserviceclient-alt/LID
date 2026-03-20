package com.lifeevent.lid.backoffice.partner.order.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderItemDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import com.lifeevent.lid.backoffice.partner.order.service.BackOfficePartnerOrderCrudService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficePartnerOrderCrudServiceImpl implements BackOfficePartnerOrderCrudService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficePartnerOrderDto> listMine(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByPartnerId(partnerId, pageable).map(this::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerOrderDetailDto getMine(Long id) {
        String partnerId = requireCurrentPartnerId();
        Order order = orderRepository.findPartnerOwnedWithCustomerAndArticlesById(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id == null ? "" : String.valueOf(id)));
        return toDetailDto(order, partnerId);
    }

    @Override
    public PartnerOrderDetailDto updateMine(Long id, PartnerOrderUpdateRequest request) {
        String partnerId = requireCurrentPartnerId();
        Order order = orderRepository.findPartnerOwnedWithCustomerAndStatusHistoryById(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id == null ? "" : String.valueOf(id)));

        if (request != null) {
            Status next = parseStatus(request.getStatus());
            if (next != null) {
                order.setCurrentStatus(next);
                appendHistory(order, next, request.getComment());
            }
            if (request.getTrackingNumber() != null && !request.getTrackingNumber().trim().isEmpty()) {
                order.setTrackingNumber(request.getTrackingNumber().trim());
            }
        }

        Order saved = orderRepository.save(order);
        Order withArticles = orderRepository.findPartnerOwnedWithCustomerAndArticlesById(saved.getId(), partnerId)
                .orElse(saved);
        return toDetailDto(withArticles, partnerId);
    }

    @Override
    public void cancelMine(Long id, String comment) {
        updateMine(id, PartnerOrderUpdateRequest.builder().status(Status.CANCELED.name()).comment(comment).build());
    }

    private BackOfficePartnerOrderDto toSummaryDto(Order order) {
        Customer customer = order.getCustomer();
        String fullName = customer == null ? null : formatFullName(customer.getFirstName(), customer.getLastName());
        return new BackOfficePartnerOrderDto(
                order.getId(),
                order.getTrackingNumber(),
                order.getCurrentStatus(),
                order.getAmount(),
                order.getCurrency(),
                customer == null ? null : customer.getUserId(),
                fullName,
                customer == null ? null : customer.getEmail(),
                order.getCreatedAt()
        );
    }

    private PartnerOrderDetailDto toDetailDto(Order order, String partnerId) {
        Customer customer = order.getCustomer();
        String fullName = customer == null ? null : formatFullName(customer.getFirstName(), customer.getLastName());
        List<PartnerOrderItemDto> items = buildPartnerItems(order, partnerId);
        double amount = items.stream()
                .filter(Objects::nonNull)
                .mapToDouble(i -> (i.getPrice() == null ? 0D : i.getPrice()) * (i.getQuantity() == null ? 0 : i.getQuantity()))
                .sum();

        return PartnerOrderDetailDto.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .status(order.getCurrentStatus())
                .amount(amount)
                .currency(order.getCurrency())
                .customerId(customer == null ? null : customer.getUserId())
                .customerName(fullName)
                .customerEmail(customer == null ? null : customer.getEmail())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private List<PartnerOrderItemDto> buildPartnerItems(Order order, String partnerId) {
        if (order == null || order.getArticles() == null) return List.of();
        return order.getArticles().stream()
                .filter(Objects::nonNull)
                .filter(oa -> isOwned(oa, partnerId))
                .map(this::toItemDto)
                .toList();
    }

    private boolean isOwned(OrderArticle oa, String partnerId) {
        if (oa == null || partnerId == null) return false;
        Article a = oa.getArticle();
        return a != null && partnerId.equals(a.getReferencePartner());
    }

    private PartnerOrderItemDto toItemDto(OrderArticle oa) {
        Article a = oa.getArticle();
        return PartnerOrderItemDto.builder()
                .articleId(a == null ? null : a.getId())
                .name(a == null ? null : a.getName())
                .quantity(oa.getQuantity())
                .price(oa.getPriceAtOrder())
                .imageUrl(a == null ? null : a.getImg())
                .build();
    }

    private void appendHistory(Order order, Status status, String comment) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment == null || comment.trim().isEmpty() ? null : comment.trim())
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
    }

    private Status parseStatus(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        try {
            return Status.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private String formatFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isEmpty() ? null : full;
    }
}

