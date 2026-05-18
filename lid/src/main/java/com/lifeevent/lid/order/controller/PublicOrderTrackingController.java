package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.PublicOrderTrackingResponseDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingItemDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingShipmentHistoryDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingShipmentDto;
import com.lifeevent.lid.order.dto.PublicOrderTrackingStepDto;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.entity.ShipmentStatusHistory;
import com.lifeevent.lid.logistics.enumeration.ShipmentShipperType;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.logistics.repository.ShipmentStatusHistoryRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/public/orders")
@RequiredArgsConstructor
public class PublicOrderTrackingController {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository shipmentStatusHistoryRepository;

    @GetMapping("/tracking/{reference}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN') or @publicOrderTrackingAccessService.canCurrentUserTrack(#reference)")
    @Transactional(readOnly = true)
    public ResponseEntity<PublicOrderTrackingResponseDto> track(@PathVariable String reference) {
        TrackingPayload payload = buildPayload(reference);
        PublicOrderTrackingResponseDto body = new PublicOrderTrackingResponseDto(
                payload.id(),
                payload.orderNumber(),
                payload.trackingNumber(),
                payload.customerValidationCode(),
                payload.deliveryType(),
                payload.status(),
                payload.amount(),
                payload.shippingCost(),
                payload.shippingMethodCode(),
                payload.shippingMethodLabel(),
                payload.currency(),
                payload.updatedAt(),
                payload.deliveryDate(),
                payload.items(),
                payload.shipments(),
                payload.history()
        );
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore().mustRevalidate().sMaxAge(0, TimeUnit.SECONDS))
                .body(body);
    }

    private TrackingPayload buildPayload(String reference) {
        String ref = reference == null ? "" : reference.trim();
        if (ref.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Référence de commande requise");
        }

        Order order = resolveOrder(ref);
        Order orderWithArticles = orderRepository.findWithCustomerAndArticlesById(order.getId()).orElse(order);
        List<PublicOrderTrackingStepDto> history = toSteps(order.getStatusHistory());
        LocalDateTime updatedAt = !history.isEmpty() ? history.get(history.size() - 1).changedAt() : order.getCreatedAt();
        String orderNumber = resolveOrderNumber(order);
        List<Shipment> shipments = shipmentRepository.findAllByOrderId(orderNumber);
        if (shipments.isEmpty()) {
            shipments = shipmentRepository.findAllByOrderId(String.valueOf(order.getId()));
        }
        Shipment shipment = shipments.isEmpty() ? null : shipments.get(0);
        String deliveryType = shipment != null ? shipment.getCarrier() : null;
        LocalDateTime estimatedDeliveryDate = shipments.stream()
                .map(Shipment::getEta)
                .filter(java.util.Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(shipment != null && shipment.getEta() != null
                        ? shipment.getEta()
                        : order.getDeliveryDate());
        List<PublicOrderTrackingShipmentDto> shipmentDtos = toShipments(shipments, orderWithArticles);
        return new TrackingPayload(
                order.getId(),
                orderNumber,
                order.getTrackingNumber(),
                shipment != null ? shipment.getDeliveryCode() : null,
                deliveryType,
                order.getCurrentStatus(),
                order.getAmount(),
                order.getShippingCost(),
                order.getShippingMethodCode(),
                order.getShippingMethodLabel(),
                order.getCurrency(),
                updatedAt,
                estimatedDeliveryDate,
                toItems(orderWithArticles),
                shipmentDtos,
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
            order = orderRepository.findWithCustomerAndStatusHistoryByOrderNumber(ref);
        }
        if (order.isEmpty()) {
            order = orderRepository.findWithCustomerAndStatusHistoryByTrackingNumber(ref);
        }
        return order.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commande introuvable"));
    }

    private String resolveOrderNumber(Order order) {
        if (order == null) {
            return null;
        }
        String orderNumber = order.getOrderNumber() == null ? "" : order.getOrderNumber().trim();
        return orderNumber.isEmpty() && order.getId() != null ? "ORD-" + order.getId() : orderNumber;
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

    private List<PublicOrderTrackingItemDto> toItems(Order order) {
        if (order == null || order.getArticles() == null || order.getArticles().isEmpty()) {
            return List.of();
        }
        return order.getArticles().stream()
                .filter(oa -> oa != null && (oa.getArticle() != null || oa.getTicketEvent() != null))
                .map(this::toTrackingItem)
                .toList();
    }

    private List<PublicOrderTrackingShipmentDto> toShipments(List<Shipment> shipments, Order order) {
        if (shipments == null || shipments.isEmpty()) {
            return List.of();
        }
        List<Long> shipmentIds = shipments.stream()
                .filter(s -> s != null && s.getId() != null)
                .map(Shipment::getId)
                .toList();
        Map<Long, List<ShipmentStatusHistory>> historyByShipmentId = shipmentIds.isEmpty()
                ? Map.of()
                : shipmentStatusHistoryRepository.findByShipmentIdInOrderByChangedAtAsc(shipmentIds)
                        .stream()
                        .collect(Collectors.groupingBy(history -> history.getShipment().getId()));
        return shipments.stream()
                .filter(java.util.Objects::nonNull)
                .map(shipment -> new PublicOrderTrackingShipmentDto(
                        shipment.getId(),
                        shipment.getTrackingId(),
                        shipment.getShipperType(),
                        shipment.getShipperId(),
                        resolveShipperLabel(shipment),
                        shipment.getCarrier(),
                        shipment.getStatus(),
                        shipment.getEta(),
                        shipment.getDeliveryCode(),
                        shipment.getCustomerFacingComment(),
                        toItems(order, shipment),
                        toShipmentHistory(shipment, historyByShipmentId.get(shipment.getId()))
                ))
                .toList();
    }

    private List<PublicOrderTrackingShipmentHistoryDto> toShipmentHistory(Shipment shipment, List<ShipmentStatusHistory> history) {
        if (history == null || history.isEmpty()) {
            return shipment == null || shipment.getStatus() == null
                    ? List.of()
                    : List.of(new PublicOrderTrackingShipmentHistoryDto(
                            shipment.getStatus(),
                            shipmentStatusLabel(shipment.getStatus()),
                            shipment.getUpdatedAt() == null ? shipment.getCreatedAt() : shipment.getUpdatedAt(),
                            null
                    ));
        }
        return history.stream()
                .filter(h -> h != null && h.getStatus() != null)
                .map(h -> new PublicOrderTrackingShipmentHistoryDto(
                        h.getStatus(),
                        shipmentStatusLabel(h.getStatus()),
                        h.getChangedAt(),
                        h.getComment()
                ))
                .toList();
    }

    private String shipmentStatusLabel(ShipmentStatus status) {
        if (status == null) {
            return "À confirmer";
        }
        return switch (status) {
            case EN_PREPARATION -> "En préparation";
            case EN_COURS -> "En livraison";
            case LIVREE -> "Livrée";
            case ECHEC -> "Incident";
        };
    }

    private List<PublicOrderTrackingItemDto> toItems(Order order, Shipment shipment) {
        if (order == null || order.getArticles() == null || order.getArticles().isEmpty()) {
            return List.of();
        }
        return order.getArticles().stream()
                .filter(oa -> oa != null && (oa.getArticle() != null || oa.getTicketEvent() != null))
                .filter(oa -> belongsToShipment(oa, shipment))
                .map(this::toTrackingItem)
                .toList();
    }

    private boolean belongsToShipment(OrderArticle orderArticle, Shipment shipment) {
        if (shipment == null || shipment.getShipperType() == null) {
            return true;
        }
        String partnerId = orderArticle.getArticle() == null ? null : trimToNull(orderArticle.getArticle().getReferencePartner());
        if (shipment.getShipperType() == ShipmentShipperType.LID) {
            return partnerId == null;
        }
        return java.util.Objects.equals(partnerId, trimToNull(shipment.getShipperId()));
    }

    private String resolveShipperLabel(Shipment shipment) {
        if (shipment == null || shipment.getShipperType() == null || shipment.getShipperType() == ShipmentShipperType.LID) {
            return "LID";
        }
        String shipperId = trimToNull(shipment.getShipperId());
        return shipperId == null ? "Partenaire" : "Partenaire " + shipperId;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private PublicOrderTrackingItemDto toTrackingItem(OrderArticle orderArticle) {
        Integer quantity = orderArticle.getQuantity() == null ? 0 : Math.max(orderArticle.getQuantity(), 0);
        Double unitPrice = orderArticle.getPriceAtOrder() == null ? 0d : orderArticle.getPriceAtOrder();
        Double subtotal = unitPrice * quantity;
        if (orderArticle.getTicketEvent() != null) {
            return new PublicOrderTrackingItemDto(
                    orderArticle.getItemType(),
                    null,
                    orderArticle.getTicketEvent().getId(),
                    orderArticle.getTicketEvent().getTitle(),
                    orderArticle.getTicketEvent().getImageUrl(),
                    quantity,
                    unitPrice,
                    subtotal
            );
        }
        return new PublicOrderTrackingItemDto(
                orderArticle.getItemType(),
                orderArticle.getArticle().getId(),
                null,
                orderArticle.getArticle().getName(),
                orderArticle.getArticle().getMainImageUrl(),
                quantity,
                unitPrice,
                subtotal
        );
    }

    private record TrackingPayload(
            Long id,
            String orderNumber,
            String trackingNumber,
            String customerValidationCode,
            String deliveryType,
            com.lifeevent.lid.order.enumeration.Status status,
            Double amount,
            Double shippingCost,
            String shippingMethodCode,
            String shippingMethodLabel,
            String currency,
            LocalDateTime updatedAt,
            LocalDateTime deliveryDate,
            List<PublicOrderTrackingItemDto> items,
            List<PublicOrderTrackingShipmentDto> shipments,
            List<PublicOrderTrackingStepDto> history
    ) {
    }
}
