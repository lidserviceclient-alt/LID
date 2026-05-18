package com.lifeevent.lid.logistics.service;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentHistorySource;
import com.lifeevent.lid.logistics.enumeration.ShipmentShipperType;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderShipmentPlanningService {

    public static final String LID_SHIPPER_ID = "LID";

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentHandoffCodeGenerator handoffCodeGenerator;
    private final ShipmentStatusTransitionService shipmentStatusTransitionService;

    public List<Shipment> planShipments(Order order) {
        Order fullOrder = resolveOrderWithArticles(order);
        String orderReference = resolveOrderNumber(fullOrder);
        if (orderReference.isBlank()) {
            return List.of();
        }

        List<Shipment> result = new ArrayList<>();
        for (ShipmentGroup group : groupShippers(fullOrder).values()) {
            Shipment shipment = shipmentRepository
                    .findByOrderIdAndShipperTypeAndShipperId(orderReference, group.type(), group.shipperId())
                    .orElseGet(() -> createShipment(orderReference, group));
            result.add(shipment);
        }
        return result;
    }

    public List<Shipment> prepareShipments(Order order, boolean lidOnly) {
        Order fullOrder = resolveOrderWithArticles(order);
        List<Shipment> shipments = planShipments(fullOrder);
        List<Shipment> prepared = new ArrayList<>();
        for (Shipment shipment : shipments) {
            if (lidOnly && shipment.getShipperType() != ShipmentShipperType.LID) {
                continue;
            }
            ensureHandoffCode(shipment);
            if (shipment.getHandoffCode() != null) {
                prepared.add(shipmentStatusTransitionService.saveWithoutStatusHistory(shipment));
            } else {
                prepared.add(shipment);
            }
        }
        if (lidOnly && prepared.stream().noneMatch(s -> s.getShipperType() == ShipmentShipperType.LID)) {
            throw new IllegalArgumentException("Aucune livraison LID pour cette commande");
        }
        return prepared;
    }

    public List<Shipment> findShipmentsForOrder(Order order) {
        String orderReference = resolveOrderNumber(order);
        if (orderReference.isBlank()) {
            return List.of();
        }
        return shipmentRepository.findAllByOrderId(orderReference);
    }

    private Shipment createShipment(String orderReference, ShipmentGroup group) {
        Shipment shipment = Shipment.builder()
                .orderId(orderReference)
                .shipperType(group.type())
                .shipperId(group.shipperId())
                .trackingId(buildTrackingId(orderReference, group))
                .carrier(group.type() == ShipmentShipperType.LID ? "LID" : "PARTNER")
                .status(ShipmentStatus.EN_PREPARATION)
                .handoffCode(handoffCodeGenerator.generateUnique())
                .build();
        return shipmentStatusTransitionService.create(
                shipment,
                "Livraison en préparation",
                ShipmentHistorySource.SYSTEM
        );
    }

    private void ensureHandoffCode(Shipment shipment) {
        if (shipment != null && trimToNull(shipment.getHandoffCode()) == null) {
            shipment.setHandoffCode(handoffCodeGenerator.generateUnique());
        }
    }

    private Map<String, ShipmentGroup> groupShippers(Order order) {
        Map<String, ShipmentGroup> groups = new LinkedHashMap<>();
        if (order == null || order.getArticles() == null) {
            return groups;
        }
        for (OrderArticle line : order.getArticles()) {
            ShipmentGroup group = resolveGroup(line);
            groups.putIfAbsent(group.key(), group);
        }
        return groups;
    }

    private ShipmentGroup resolveGroup(OrderArticle line) {
        Article article = line == null ? null : line.getArticle();
        String partnerId = trimToNull(article == null ? null : article.getReferencePartner());
        if (partnerId == null) {
            return new ShipmentGroup(ShipmentShipperType.LID, LID_SHIPPER_ID);
        }
        return new ShipmentGroup(ShipmentShipperType.PARTNER, partnerId);
    }

    private Order resolveOrderWithArticles(Order order) {
        if (order == null || order.getId() == null) {
            return order;
        }
        return orderRepository.findWithCustomerAndArticlesById(order.getId()).orElse(order);
    }

    private String resolveOrderNumber(Order order) {
        if (order == null) {
            return "";
        }
        String orderNumber = trimToNull(order.getOrderNumber());
        return orderNumber == null && order.getId() != null ? "ORD-" + order.getId() : (orderNumber == null ? "" : orderNumber);
    }

    private String buildTrackingId(String orderReference, ShipmentGroup group) {
        String prefix = group.type() == ShipmentShipperType.LID
                ? "LID"
                : "PART-" + sanitizePartnerCode(group.shipperId());
        return "TRK-" + prefix + "-" + sanitize(orderReference);
    }

    private String sanitizePartnerCode(String value) {
        String code = sanitize(value);
        if (code.startsWith("PARTNER-")) {
            return code.substring("PARTNER-".length());
        }
        return code;
    }

    private String sanitize(String value) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            return "";
        }
        return normalized.replaceAll("[^A-Za-z0-9-]", "-").replaceAll("-+", "-").toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record ShipmentGroup(ShipmentShipperType type, String shipperId) {
        String key() {
            return type + ":" + shipperId;
        }
    }
}
