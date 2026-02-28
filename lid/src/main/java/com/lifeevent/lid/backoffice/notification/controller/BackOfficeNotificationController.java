package com.lifeevent.lid.backoffice.notification.controller;

import com.lifeevent.lid.message.entity.EmailMessage;
import com.lifeevent.lid.message.repository.EmailMessageRepository;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.Refund;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.RefundRepository;
import com.lifeevent.lid.stock.entity.StockMovement;
import com.lifeevent.lid.stock.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/back-office/notifications")
@RequiredArgsConstructor
public class BackOfficeNotificationController implements IBackOfficeNotificationController {

    private final EmailMessageRepository emailMessageRepository;
    private final OrderRepository orderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ShipmentRepository shipmentRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    @Override
    public ResponseEntity<Map<String, Object>> getNotifications(int page, int size, String since) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Instant sinceInstant = parseSince(since);
        List<NotificationItem> all = loadAllNotifications(sinceInstant);
        int from = Math.min(safePage * safeSize, all.size());
        int to = Math.min(from + safeSize, all.size());
        List<Map<String, Object>> content = all.subList(from, to).stream().map(this::toPayload).toList();
        int totalPages = safeSize == 0 ? 0 : (int) Math.ceil((double) all.size() / safeSize);

        Map<String, Object> payload = Map.of(
                "content", content,
                "page", safePage,
                "size", safeSize,
                "totalElements", all.size(),
                "totalPages", totalPages
        );
        return ResponseEntity.ok(payload);
    }

    @Override
    public ResponseEntity<Long> getNotificationsCount(String since) {
        Instant sinceInstant = parseSince(since);
        long count = loadAllNotifications(sinceInstant).size();
        return ResponseEntity.ok(count);
    }

    private Instant parseSince(String since) {
        if (since == null || since.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(since);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametre 'since' invalide.");
        }
    }

    private List<NotificationItem> loadAllNotifications(Instant since) {
        List<NotificationItem> out = new ArrayList<>();

        for (Order order : orderRepository.findAll()) {
            if (!isSinceMatch(order.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "ORDER-" + order.getId(),
                    order.getCreatedAt(),
                    "Commande #" + order.getId() + " (" + order.getCurrentStatus() + ")",
                    fallbackActor(order.getCreatedBy()),
                    "POST",
                    "/orders"
            ));
        }

        for (StockMovement movement : stockMovementRepository.findAll()) {
            if (!isSinceMatch(movement.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "STOCK-" + movement.getId(),
                    movement.getCreatedAt(),
                    "Mouvement de stock " + movement.getType() + " (" + movement.getQuantity() + ")",
                    fallbackActor(movement.getCreatedBy()),
                    "POST",
                    "/inventory"
            ));
        }

        for (Shipment shipment : shipmentRepository.findAll()) {
            if (!isSinceMatch(shipment.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "SHIPMENT-" + shipment.getId(),
                    shipment.getCreatedAt(),
                    "Expedition #" + shipment.getId() + " (" + shipment.getStatus() + ")",
                    fallbackActor(shipment.getCreatedBy()),
                    "POST",
                    "/logistics"
            ));
        }

        for (Payment payment : paymentRepository.findAll()) {
            if (!isSinceMatch(payment.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "PAYMENT-" + payment.getId(),
                    payment.getCreatedAt(),
                    "Paiement #" + payment.getId() + " (" + payment.getStatus() + ")",
                    fallbackActor(payment.getCreatedBy()),
                    "POST",
                    "/finance"
            ));
        }

        for (Refund refund : refundRepository.findAll()) {
            if (!isSinceMatch(refund.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "REFUND-" + refund.getId(),
                    refund.getCreatedAt(),
                    "Remboursement #" + refund.getId() + " (" + refund.getStatus() + ")",
                    fallbackActor(refund.getCreatedBy()),
                    "POST",
                    "/finance"
            ));
        }

        for (EmailMessage message : emailMessageRepository.findAll()) {
            if (!isSinceMatch(message.getCreatedAt(), since)) continue;
            out.add(new NotificationItem(
                    "MESSAGE-" + message.getId(),
                    message.getCreatedAt(),
                    message.getSubject() == null || message.getSubject().isBlank() ? "Message backoffice" : message.getSubject(),
                    fallbackActor(message.getCreatedBy()),
                    "POST",
                    "/messages"
            ));
        }

        return out.stream()
                .sorted(Comparator.comparing(NotificationItem::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private boolean isSinceMatch(LocalDateTime createdAt, Instant since) {
        if (since == null) return true;
        if (createdAt == null) return false;
        return !createdAt.toInstant(ZoneOffset.UTC).isBefore(since);
    }

    private String fallbackActor(String actor) {
        return actor == null || actor.isBlank() ? "system" : actor;
    }

    private Map<String, Object> toPayload(NotificationItem item) {
        return Map.of(
                "id", item.id(),
                "summary", item.summary(),
                "actor", item.actor(),
                "method", item.method(),
                "path", item.path()
        );
    }

    private record NotificationItem(
            String id,
            LocalDateTime createdAt,
            String summary,
            String actor,
            String method,
            String path
    ) {}
}
