package com.lifeevent.lid.backoffice.lid.order.service.impl;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestItemDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeReturnRequestService;
import com.lifeevent.lid.common.cache.event.PartnerOrderChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeReturnRequestServiceImpl implements BackOfficeReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PartnerRepository partnerRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeReturnRequestDto> getAll(ReturnRequestStatus status, String q, Pageable pageable) {
        String query = q == null ? "" : q.trim();
        Page<ReturnRequest> results = findReturns(status, query, pageable);
        return results.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeReturnRequestDto getById(Long id) {
        return toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeReturnRequestDto updateStatus(Long id, BackOfficeReturnRequestUpdateDto request) {
        ReturnRequest entity = findByIdOrThrow(id);
        if (request == null || request.status() == null) {
            return toDto(entity);
        }
        ReturnRequestStatus nextStatus = request.status();
        if (nextStatus == entity.getStatus()) {
            return toDto(entity);
        }
        entity.setStatus(nextStatus);
        syncOrderTrackingTimeline(entity, nextStatus);
        ReturnRequest saved = returnRequestRepository.save(entity);
        return toDto(saved);
    }

    private void syncOrderTrackingTimeline(ReturnRequest request, ReturnRequestStatus returnStatus) {
        if (request == null || request.getOrderId() == null || returnStatus == null) {
            return;
        }

        Order order = orderRepository.findById(request.getOrderId()).orElse(null);
        if (order == null) {
            return;
        }

        Status targetOrderStatus = mapReturnStatusToOrderStatus(returnStatus, order.getCurrentStatus());
        if (targetOrderStatus != null && targetOrderStatus != order.getCurrentStatus()) {
            order.setCurrentStatus(targetOrderStatus);
        }

        Status historyStatus = order.getCurrentStatus() == null ? Status.PENDING : order.getCurrentStatus();
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(historyStatus)
                .comment(buildReturnStatusComment(returnStatus))
                .changedAt(LocalDateTime.now())
                .build();

        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }
        order.getStatusHistory().add(history);
        orderRepository.save(order);

        publishPartnerOrderChanged(order.getId());
    }

    private Status mapReturnStatusToOrderStatus(ReturnRequestStatus returnStatus, Status currentOrderStatus) {
        if (returnStatus == ReturnRequestStatus.REFUNDED
                || returnStatus == ReturnRequestStatus.COMPLETED
                || returnStatus == ReturnRequestStatus.CLOSED) {
            return Status.DELIVERED;
        }
        return currentOrderStatus;
    }

    private String buildReturnStatusComment(ReturnRequestStatus status) {
        return switch (status) {
            case SUBMITTED -> "Demande de retour soumise";
            case UNDER_REVIEW -> "Demande de retour en analyse";
            case APPROVED -> "Demande de retour approuvee";
            case REJECTED -> "Demande de retour rejetee";
            case REFUNDED -> "Retour rembourse";
            case COMPLETED -> "Retour finalise";
            case CLOSED -> "Dossier de retour clos";
        };
    }

    private void publishPartnerOrderChanged(Long orderId) {
        if (orderId == null) {
            return;
        }
        Set<String> partnerIds = orderRepository.findDistinctPartnerIdsByOrderId(orderId);
        if (partnerIds == null || partnerIds.isEmpty()) {
            return;
        }
        eventPublisher.publishEvent(new PartnerOrderChangedEvent(partnerIds));
    }

    private Page<ReturnRequest> findReturns(ReturnRequestStatus status, String query, Pageable pageable) {
        if (status != null && !query.isBlank()) {
            return returnRequestRepository.searchByStatusAndQuery(status, query, pageable);
        }
        if (status != null) {
            return returnRequestRepository.findByStatus(status, pageable);
        }
        if (!query.isBlank()) {
            return returnRequestRepository.findByOrderNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        }
        return returnRequestRepository.findAll(pageable);
    }

    private ReturnRequest findByIdOrThrow(Long id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", String.valueOf(id)));
    }

    private BackOfficeReturnRequestDto toDto(ReturnRequest entity) {
        List<BackOfficeReturnRequestItemDto> items = entity.getItems() == null
                ? List.of()
                : entity.getItems().stream().map(this::toItem).toList();

        return new BackOfficeReturnRequestDto(
                entity.getId(),
                entity.getOrderNumber(),
                entity.getEmail(),
                resolveCustomerPhone(entity.getEmail()),
                entity.getReason(),
                entity.getDetails(),
                entity.getStatus(),
                entity.getCreatedAt(),
                items
        );
    }

    private BackOfficeReturnRequestItemDto toItem(ReturnRequestItem item) {
        if (item == null) {
            return new BackOfficeReturnRequestItemDto(null, null, "-", 0, null);
        }
        return new BackOfficeReturnRequestItemDto(
                item.getId(),
                item.getArticleId(),
                item.getArticleName(),
                item.getQuantity(),
                item.getUnitPrice()
        );
    }

    private String resolveCustomerPhone(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return customerRepository.findByEmail(normalized)
                .map(c -> c.getPhoneNumber())
                .or(() -> partnerRepository.findByEmailWithShop(normalized).map(p -> p.getPhoneNumber()))
                .orElse(null);
    }
}
