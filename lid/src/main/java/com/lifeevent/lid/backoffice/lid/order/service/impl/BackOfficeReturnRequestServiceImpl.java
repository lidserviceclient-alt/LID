package com.lifeevent.lid.backoffice.lid.order.service.impl;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestItemDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeAppConfigEntity;
import com.lifeevent.lid.backoffice.lid.setting.entity.CustomerRefundMode;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeAppConfigRepository;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeReturnRequestService;
import com.lifeevent.lid.common.cache.event.PartnerOrderChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.service.EmailService;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.ReturnRefundStatus;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import com.lifeevent.lid.payment.dto.RefundRequestDto;
import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.service.RefundService;
import com.lifeevent.lid.payment.partner.service.PartnerSettlementService;
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
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeReturnRequestServiceImpl implements BackOfficeReturnRequestService {

    private static final int DEFAULT_RETURN_WINDOW_MAX = 30;
    private static final String DEFAULT_RETURN_WINDOW_UNIT = "DAYS";

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PartnerRepository partnerRepository;
    private final PaymentRepository paymentRepository;
    private final RefundService refundService;
    private final BackOfficeAppConfigRepository appConfigRepository;
    private final PartnerSettlementService partnerSettlementService;
    private final EmailService emailService;
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
        ReturnRequestStatus nextStatus = resolveNextStatus(entity, request.status());
        boolean statusChanged = nextStatus != entity.getStatus();
        boolean refundStateChanged = request.status() == ReturnRequestStatus.APPROVED || request.status() == ReturnRequestStatus.REFUNDED;
        if (!statusChanged && !refundStateChanged) {
            return toDto(entity);
        }
        entity.setStatus(nextStatus);
        if (statusChanged) {
            syncOrderTrackingTimeline(entity, nextStatus);
        }
        ReturnRequest saved = returnRequestRepository.save(entity);
        partnerSettlementService.syncOrderSettlements(saved.getOrderId());
        sendReturnStatusEmail(saved);
        return toDto(saved);
    }

    private ReturnRequestStatus resolveNextStatus(ReturnRequest request, ReturnRequestStatus requestedStatus) {
        if (request == null || requestedStatus == null) {
            return request == null ? null : request.getStatus();
        }
        if (requestedStatus != ReturnRequestStatus.APPROVED && requestedStatus != ReturnRequestStatus.REFUNDED) {
            return requestedStatus;
        }

        if (request.getRefundStatus() == ReturnRefundStatus.COMPLETED) {
            return ReturnRequestStatus.REFUNDED;
        }
        if (request.getRefundStatus() == ReturnRefundStatus.PROCESSING || request.getRefundStatus() == ReturnRefundStatus.MANUAL_REVIEW) {
            return ReturnRequestStatus.APPROVED;
        }

        Order order = orderRepository.findById(request.getOrderId()).orElse(null);
        if (order == null || !isWithinReturnWindow(order)) {
            request.setRefundStatus(ReturnRefundStatus.FAILED);
            return ReturnRequestStatus.APPROVED;
        }

        Payment payment = paymentRepository.findTopByOrderIdAndStatusOrderByPaymentDateDescCreatedAtDesc(order.getId(), PaymentStatus.COMPLETED)
                .orElse(null);
        if (payment == null) {
            request.setRefundStatus(ReturnRefundStatus.FAILED);
            return ReturnRequestStatus.APPROVED;
        }

        try {
            BigDecimal refundAmount = computeRefundAmount(order);
            RefundResponseDto refund = refundService.requestRefund(RefundRequestDto.builder()
                    .paymentId(payment.getId())
                    .amount(refundAmount)
                    .reason(buildRefundReason(request))
                    .build());
            refundService.processRefund(refund.getId());
            RefundResponseDto processed = refundService.getRefundById(refund.getId());
            request.setRefundAmount(processed.getAmount());
            request.setRefundReference(processed.getRefundId());
            request.setRefundStatus(mapRefundStatus(processed.getStatus()));
            return request.getRefundStatus() == ReturnRefundStatus.COMPLETED
                    ? ReturnRequestStatus.REFUNDED
                    : ReturnRequestStatus.APPROVED;
        } catch (Exception ignored) {
            request.setRefundStatus(ReturnRefundStatus.MANUAL_REVIEW);
            return ReturnRequestStatus.APPROVED;
        }
    }

    private boolean isWithinReturnWindow(Order order) {
        if (order == null) {
            return false;
        }
        BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc().orElse(null);
        String unit = normalizeReturnWindowUnit(config == null ? null : config.getReturnWindowUnit());
        int max = normalizeReturnWindowMax(config == null ? null : config.getReturnWindowMax());
        LocalDateTime referenceDate = order.getDeliveryDate() != null ? order.getDeliveryDate() : order.getCreatedAt();
        if (referenceDate == null) {
            return false;
        }
        LocalDateTime deadline = "HOURS".equals(unit) ? referenceDate.plusHours(max) : referenceDate.plusDays(max);
        return !LocalDateTime.now().isAfter(deadline);
    }

    private BigDecimal computeRefundAmount(Order order) {
        BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc().orElse(null);
        CustomerRefundMode refundMode = config == null || config.getCustomerRefundMode() == null
                ? CustomerRefundMode.FULL_WITH_SHIPPING
                : config.getCustomerRefundMode();
        BigDecimal orderAmount = money(order == null ? null : order.getAmount());
        BigDecimal shippingCost = money(order == null ? null : order.getShippingCost());
        if (refundMode == CustomerRefundMode.ORDER_ONLY) {
            return orderAmount.subtract(shippingCost).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        }
        return orderAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private String buildRefundReason(ReturnRequest request) {
        String orderNumber = request == null || request.getOrderNumber() == null ? "-" : request.getOrderNumber();
        String reason = request == null || request.getReason() == null ? "Retour approuvé" : request.getReason();
        return ("Retour commande " + orderNumber + " - " + reason).trim();
    }

    private ReturnRefundStatus mapRefundStatus(String rawStatus) {
        if (rawStatus == null) {
            return ReturnRefundStatus.PENDING;
        }
        return switch (rawStatus.trim().toUpperCase(Locale.ROOT)) {
            case "COMPLETED" -> ReturnRefundStatus.COMPLETED;
            case "PROCESSING" -> ReturnRefundStatus.PROCESSING;
            case "FAILED" -> ReturnRefundStatus.FAILED;
            case "PENDING" -> ReturnRefundStatus.PENDING;
            default -> ReturnRefundStatus.MANUAL_REVIEW;
        };
    }

    private String normalizeReturnWindowUnit(String raw) {
        String normalized = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        return "HOURS".equals(normalized) ? "HOURS" : DEFAULT_RETURN_WINDOW_UNIT;
    }

    private int normalizeReturnWindowMax(Integer raw) {
        return raw == null || raw <= 0 ? DEFAULT_RETURN_WINDOW_MAX : raw;
    }

    private BigDecimal money(Double value) {
        if (value == null || !Double.isFinite(value)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
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

    private void sendReturnStatusEmail(ReturnRequest request) {
        if (request == null) {
            return;
        }
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        if (email.isBlank()) {
            return;
        }
        String subject = switch (request.getStatus()) {
            case APPROVED -> "Votre demande de retour a ete acceptee";
            case REJECTED -> "Mise a jour de votre demande de retour";
            case REFUNDED -> "Votre retour a ete rembourse";
            default -> null;
        };
        if (subject == null) {
            return;
        }
        String body = buildReturnStatusEmailBody(request);
        try {
            emailService.send(email, subject, body);
        } catch (Exception ex) {
            // Ne bloque pas le traitement du retour si l'email échoue
        }
    }

    private String buildReturnStatusEmailBody(ReturnRequest request) {
        String orderNumber = request.getOrderNumber() == null ? "-" : request.getOrderNumber();
        String statusMessage = switch (request.getStatus()) {
            case APPROVED -> "Votre demande de retour a ete acceptee.";
            case REJECTED -> "Votre demande de retour a ete refusee.";
            case REFUNDED -> "Le remboursement de votre retour a ete traite.";
            default -> "Votre demande de retour a ete mise a jour.";
        };
        return """
                Bonjour,

                %s

                Commande : %s
                Reference retour : %s
                %s

                Vous pouvez consulter l'etat de votre commande et de votre retour depuis votre espace de suivi.

                Cordialement,
                L'equipe LID
                """.formatted(
                statusMessage,
                orderNumber,
                request.getId(),
                request.getRefundAmount() == null ? "" : "Montant rembourse : " + request.getRefundAmount()
        );
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
                entity.getRefundAmount(),
                entity.getRefundStatus(),
                entity.getRefundReference(),
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
