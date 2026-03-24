package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.PublicOrderTrackingResponseDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingStepDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingV2ResponseDto;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/public/orders")
@RequiredArgsConstructor
public class PublicOrderTrackingController {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    @GetMapping("/tracking/{reference}")
    @Transactional(readOnly = true)
    public PublicOrderTrackingResponseDto track(@PathVariable String reference) {
        TrackingPayload payload = buildPayload(reference);
        return new PublicOrderTrackingResponseDto(
                payload.id(),
                payload.orderNumber(),
                payload.trackingNumber(),
                payload.deliveryType(),
                payload.status(),
                payload.updatedAt(),
                payload.deliveryDate(),
                payload.history()
        );
    }

    @GetMapping("/tracking/v2/{reference}")
    @Transactional(readOnly = true)
    public PublicOrderTrackingV2ResponseDto trackV2(@PathVariable String reference) {
        TrackingPayload payload = buildPayload(reference);
        return new PublicOrderTrackingV2ResponseDto(
                payload.id(),
                payload.orderNumber(),
                payload.trackingNumber(),
                payload.deliveryType(),
                payload.status(),
                payload.updatedAt(),
                payload.deliveryDate(),
                payload.history()
        );
    }

    private TrackingPayload buildPayload(String reference) {
        String ref = reference == null ? "" : reference.trim();
        if (ref.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Référence de commande requise");
        }

        Order order = resolveOrder(ref);
        List<PublicOrderTrackingStepDto> history = toSteps(order.getStatusHistory());
        LocalDateTime updatedAt = !history.isEmpty() ? history.get(history.size() - 1).changedAt() : order.getCreatedAt();
        Shipment shipment = shipmentRepository.findByOrderId(String.valueOf(order.getId())).orElse(null);
        String deliveryType = shipment != null ? shipment.getCarrier() : null;
        LocalDateTime estimatedDeliveryDate = shipment != null && shipment.getEta() != null
                ? shipment.getEta().atStartOfDay()
                : order.getDeliveryDate();
        return new TrackingPayload(
                order.getId(),
                "ORD-" + order.getId(),
                order.getTrackingNumber(),
                deliveryType,
                order.getCurrentStatus(),
                updatedAt,
                estimatedDeliveryDate,
                history
        );
    }

    private Order resolveOrder(String ref) {
        Long id = tryExtractOrderId(ref);
        Optional<Order> order = Optional.empty();
        if (id != null) {
            order = orderRepository.findWithCustomerAndStatusHistoryById(id);
        }
        if (order.isEmpty()) {
            order = orderRepository.findWithCustomerAndStatusHistoryByTrackingNumber(ref);
        }
        return order.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commande introuvable"));
    }

    private Long tryExtractOrderId(String reference) {
        String digits = reference.replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private List<PublicOrderTrackingStepDto> toSteps(List<StatusHistory> statusHistory) {
        if (statusHistory == null || statusHistory.isEmpty()) {
            return List.of();
        }
        return statusHistory.stream()
                .filter(s -> s != null && s.getStatus() != null)
                .sorted(Comparator.comparing(StatusHistory::getChangedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(s -> new PublicOrderTrackingStepDto(s.getStatus(), s.getChangedAt(), s.getComment()))
                .toList();
    }

    private record TrackingPayload(
            Long id,
            String orderNumber,
            String trackingNumber,
            String deliveryType,
            com.lifeevent.lid.order.enumeration.Status status,
            LocalDateTime updatedAt,
            LocalDateTime deliveryDate,
            List<PublicOrderTrackingStepDto> history
    ) {
    }
}
