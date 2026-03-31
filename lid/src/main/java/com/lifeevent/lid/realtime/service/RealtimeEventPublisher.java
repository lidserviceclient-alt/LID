package com.lifeevent.lid.realtime.service;

import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.realtime.config.RealtimeProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final RealtimeOutboxService outboxService;
    private final RealtimeProperties properties;
    private final OrderRepository orderRepository;

    public void publishBackofficeNotificationsCountUpdated(String actorUserId, String source) {
        if (!properties.getTopics().isBackofficeNotificationsEnabled()) {
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("actorUserId", actorUserId);
        payload.put("source", source);
        payload.put("updatedAt", LocalDateTime.now());
        outboxService.enqueue(
                RealtimeTopics.BACKOFFICE_NOTIFICATIONS_COUNT_UPDATED,
                "NOTIFICATIONS_COUNT_UPDATED",
                payload,
                "notifications:" + (source == null ? "unknown" : source)
        );
    }

    public void publishBackofficeOverviewUpdated(String reason) {
        if (!properties.getTopics().isBackofficeOverviewEnabled()) {
            return;
        }
        outboxService.enqueue(
                RealtimeTopics.BACKOFFICE_OVERVIEW_UPDATED,
                "BACKOFFICE_OVERVIEW_UPDATED",
                Map.of("reason", reason == null ? "unknown" : reason),
                "overview:" + (reason == null ? "unknown" : reason)
        );
    }

    public void publishDeliveryShipmentUpdated(Long shipmentId,
                                               String orderId,
                                               String status,
                                               String carrier,
                                               String trigger) {
        if (!properties.getTopics().isDeliveryShipmentEnabled()) {
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("shipmentId", shipmentId);
        payload.put("orderId", orderId);
        payload.put("status", status);
        payload.put("carrier", carrier);
        payload.put("trigger", trigger);
        outboxService.enqueue(
                RealtimeTopics.DELIVERY_SHIPMENT_UPDATED,
                "DELIVERY_SHIPMENT_UPDATED",
                payload,
                "shipment:" + shipmentId + ":" + (status == null ? "UNKNOWN" : status)
        );
    }

    public void publishPaymentStatusUpdated(Payment payment, String trigger) {
        if (!properties.getTopics().isPaymentStatusEnabled() || payment == null) {
            return;
        }

        String targetUserId = resolvePaymentTargetUserId(payment);
        if (targetUserId == null || targetUserId.isBlank()) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("paymentId", payment.getId());
        payload.put("orderId", payment.getOrderId());
        payload.put("invoiceToken", payment.getInvoiceToken());
        payload.put("status", payment.getStatus() == null ? null : payment.getStatus().name());
        payload.put("trigger", trigger);
        payload.put("targetUserId", targetUserId);

        outboxService.enqueue(
                RealtimeTopics.PAYMENT_STATUS_UPDATED,
                "PAYMENT_STATUS_UPDATED",
                payload,
                "payment:" + payment.getInvoiceToken() + ":" + (payment.getStatus() == null ? "UNKNOWN" : payment.getStatus().name()) + ":" + targetUserId
        );
    }

    private String resolvePaymentTargetUserId(Payment payment) {
        Long orderId = payment.getOrderId();
        if (orderId == null) {
            return null;
        }
        return orderRepository.findCustomerUserIdByOrderId(orderId)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .orElse(null);
    }

    public void publishCatalogUpdated(String reason) {
        if (!properties.getTopics().isCatalogEnabled()) {
            return;
        }
        outboxService.enqueue(
                RealtimeTopics.CATALOG_UPDATED,
                "CATALOG_UPDATED",
                Map.of("reason", reason == null ? "unknown" : reason),
                "catalog:" + (reason == null ? "unknown" : reason)
        );
    }
}
