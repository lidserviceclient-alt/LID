package com.lifeevent.lid.backoffice.lid.logistics.service.impl;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentItemDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.backoffice.lid.logistics.mapper.BackOfficeShipmentMapper;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.common.cache.event.PartnerOrderChangedEvent;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeLogisticsServiceImpl implements BackOfficeLogisticsService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final BackOfficeShipmentMapper backOfficeShipmentMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public LogisticsKpisDto getKpis(Integer days) {
        int safeDays = normalizeDays(days);
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        long inTransitCount = shipmentRepository.countByStatus(ShipmentStatus.EN_COURS);
        double avgDelayDays = computeAverageDelayDays(from);
        double avgCost = shipmentRepository.avgCostFrom(from);

        return LogisticsKpisDto.builder()
                .inTransitCount(inTransitCount)
                .avgDelayDays(avgDelayDays)
                .avgCost(avgCost)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeShipmentDto> getShipments(Pageable pageable, ShipmentStatus status, String carrier, String q) {
        return shipmentRepository.search(status, carrier, q, pageable)
                .map(backOfficeShipmentMapper::toDto);
    }

    @Override
    public BackOfficeShipmentDto upsertShipment(BackOfficeShipmentDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Requête invalide");
        }

        Shipment shipment = resolveShipmentForUpsert(dto);
        validateOrderId(shipment.getOrderId());
        applyDeliveryLifecycle(shipment, shipment.getStatus());

        Shipment saved = shipmentRepository.save(shipment);
        syncLinkedOrder(saved);
        return backOfficeShipmentMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeShipmentDetailDto getShipment(Long id) {
        Shipment shipment = findShipmentById(id);
        return toDetail(shipment);
    }

    @Override
    public BackOfficeShipmentDto updateShipmentStatus(Long id, ShipmentStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Statut requis");
        }

        Shipment shipment = findShipmentById(id);
        applyDeliveryLifecycle(shipment, status);

        Shipment saved = shipmentRepository.save(shipment);
        syncLinkedOrder(saved);
        return backOfficeShipmentMapper.toDto(saved);
    }

    @Override
    public BackOfficeShipmentDetailDto scanShipment(BackOfficeShipmentScanRequest request, String scannedBy) {
        if (request == null || isBlank(request.getQr())) {
            throw new IllegalArgumentException("QR requis");
        }

        Shipment shipment = resolveShipmentFromQr(request.getQr())
                .orElseThrow(() -> new IllegalArgumentException("Expedition introuvable"));

        if (shipment.getStatus() == ShipmentStatus.LIVREE) {
            throw new IllegalArgumentException("Commande déjà livrée");
        }

        fillCourierData(shipment, request, scannedBy);
        if (shipment.getStatus() != ShipmentStatus.EN_COURS) {
            shipment.setStatus(ShipmentStatus.EN_COURS);
            shipment.setDeliveredAt(null);
            shipment.setScannedAt(LocalDateTime.now());
        } else if (shipment.getScannedAt() == null) {
            shipment.setScannedAt(LocalDateTime.now());
        }

        ensureDeliveryCode(shipment);

        Shipment saved = shipmentRepository.save(shipment);
        syncLinkedOrder(saved);
        return toDetail(saved);
    }

    @Override
    public BackOfficeShipmentDto confirmDelivery(Long id, BackOfficeShipmentDeliveryConfirmRequest request) {
        if (request == null || isBlank(request.getCode())) {
            throw new IllegalArgumentException("Code requis");
        }

        Shipment shipment = findShipmentById(id);
        if (shipment.getStatus() != ShipmentStatus.EN_COURS) {
            throw new IllegalArgumentException("Livraison pas en transit");
        }

        String expectedCode = trimToNull(shipment.getDeliveryCode());
        String providedCode = trimToNull(request.getCode());
        if (!Objects.equals(expectedCode, providedCode)) {
            throw new IllegalArgumentException("Code invalide");
        }

        shipment.setStatus(ShipmentStatus.LIVREE);
        shipment.setDeliveredAt(LocalDateTime.now());

        Shipment saved = shipmentRepository.save(shipment);
        syncLinkedOrder(saved);
        return backOfficeShipmentMapper.toDto(saved);
    }

    private Shipment resolveShipmentForUpsert(BackOfficeShipmentDto dto) {
        Shipment shipment = null;
        if (dto.getId() != null) {
            shipment = shipmentRepository.findById(dto.getId()).orElse(null);
        }

        if (shipment == null && !isBlank(dto.getOrderId())) {
            shipment = shipmentRepository.findByOrderId(dto.getOrderId().trim()).orElse(null);
        }

        if (shipment == null) {
            shipment = backOfficeShipmentMapper.toEntity(dto);
        } else {
            backOfficeShipmentMapper.updateEntityFromDto(dto, shipment);
        }

        if (shipment.getStatus() == null) {
            shipment.setStatus(ShipmentStatus.EN_PREPARATION);
        }

        return shipment;
    }

    private void validateOrderId(String orderId) {
        Long parsedOrderId = parseOrderId(orderId);
        orderRepository.findById(parsedOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));
    }

    private Shipment findShipmentById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Expedition introuvable");
        }
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expedition introuvable"));
    }

    private Optional<Shipment> resolveShipmentFromQr(String qr) {
        String token = trimToNull(qr);
        if (token == null) {
            return Optional.empty();
        }

        String normalized = token.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("shipment:")) {
            return findShipmentByIdToken(token.substring("shipment:".length()));
        }
        if (normalized.startsWith("id:")) {
            return findShipmentByIdToken(token.substring("id:".length()));
        }
        if (normalized.startsWith("tracking:")) {
            return shipmentRepository.findByTrackingIdIgnoreCase(token.substring("tracking:".length()).trim());
        }
        if (normalized.contains("tracking=")) {
            return shipmentRepository.findByTrackingIdIgnoreCase(extractQueryValue(token, "tracking"));
        }
        if (normalized.contains("shipmentId=".toLowerCase(Locale.ROOT))) {
            return findShipmentByIdToken(extractQueryValue(token, "shipmentId"));
        }

        Optional<Shipment> byTracking = shipmentRepository.findByTrackingIdIgnoreCase(token);
        if (byTracking.isPresent()) {
            return byTracking;
        }

        Optional<Shipment> byOrder = shipmentRepository.findByOrderId(token);
        if (byOrder.isPresent()) {
            return byOrder;
        }

        return findShipmentByIdToken(token);
    }

    private Optional<Shipment> findShipmentByIdToken(String value) {
        try {
            Long id = Long.parseLong(value.trim());
            return shipmentRepository.findById(id);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private String extractQueryValue(String raw, String key) {
        String[] parts = raw.split("[?&]");
        String expected = key.toLowerCase(Locale.ROOT) + "=";
        for (String part : parts) {
            String lower = part.toLowerCase(Locale.ROOT);
            if (lower.startsWith(expected)) {
                return part.substring(expected.length()).trim();
            }
        }
        return raw;
    }

    private void fillCourierData(Shipment shipment, BackOfficeShipmentScanRequest request, String scannedBy) {
        String scannedBySafe = trimToNull(scannedBy);
        String courierReference = trimToNull(request.getCourierReference());
        if (courierReference == null) {
            courierReference = scannedBySafe;
        }

        shipment.setCourierReference(courierReference);
        shipment.setCourierName(trimToNull(request.getCourierName()));
        shipment.setCourierPhone(trimToNull(request.getCourierPhone()));
        shipment.setCourierUser(scannedBySafe);
    }

    private void ensureDeliveryCode(Shipment shipment) {
        if (!isBlank(shipment.getDeliveryCode())) {
            return;
        }

        shipment.setDeliveryCode(generate4DigitCode());
        shipment.setDeliveryCodeGeneratedAt(LocalDateTime.now());
    }

    private String generate4DigitCode() {
        int value = ThreadLocalRandom.current().nextInt(1000, 10000);
        return String.valueOf(value);
    }

    private void applyDeliveryLifecycle(Shipment shipment, ShipmentStatus status) {
        shipment.setStatus(status);
        if (status == ShipmentStatus.LIVREE) {
            if (shipment.getDeliveredAt() == null) {
                shipment.setDeliveredAt(LocalDateTime.now());
            }
            return;
        }
        shipment.setDeliveredAt(null);
    }

    private BackOfficeShipmentDetailDto toDetail(Shipment shipment) {
        Optional<Order> orderOpt = findLinkedOrder(shipment);
        Order order = orderOpt.orElse(null);

        return BackOfficeShipmentDetailDto.builder()
                .id(shipment.getId())
                .trackingId(shipment.getTrackingId())
                .orderId(shipment.getOrderId())
                .carrier(shipment.getCarrier())
                .status(shipment.getStatus())
                .eta(shipment.getEta())
                .cost(shipment.getCost())
                .orderTotal(order != null ? order.getAmount() : null)
                .currency(order != null ? order.getCurrency() : null)
                .paid(isOrderPaid(order))
                .customerName(resolveCustomerName(order))
                .customerEmail(resolveCustomerEmail(order))
                .customerPhone(resolveCustomerPhone(order))
                .customerAddress(resolveCustomerAddress(order))
                .items(resolveItems(order))
                .courierReference(shipment.getCourierReference())
                .courierName(shipment.getCourierName())
                .courierPhone(shipment.getCourierPhone())
                .courierUser(shipment.getCourierUser())
                .scannedAt(shipment.getScannedAt())
                .build();
    }

    private Optional<Order> findLinkedOrder(Shipment shipment) {
        if (shipment == null) {
            return Optional.empty();
        }

        String orderId = trimToNull(shipment.getOrderId());
        if (orderId == null) {
            return Optional.empty();
        }

        try {
            return orderRepository.findById(Long.parseLong(orderId));
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private List<BackOfficeShipmentItemDto> resolveItems(Order order) {
        if (order == null || order.getArticles() == null) {
            return List.of();
        }

        List<BackOfficeShipmentItemDto> items = new ArrayList<>();
        for (OrderArticle articleLine : order.getArticles()) {
            if (articleLine == null || articleLine.getArticle() == null) {
                continue;
            }
            int quantity = articleLine.getQuantity() == null ? 0 : articleLine.getQuantity();
            double unitPrice = articleLine.getPriceAtOrder() == null ? 0d : articleLine.getPriceAtOrder();
            items.add(BackOfficeShipmentItemDto.builder()
                    .productId(articleLine.getArticle().getId())
                    .productName(articleLine.getArticle().getName())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .lineTotal(unitPrice * quantity)
                    .build());
        }
        return items;
    }

    private String resolveCustomerName(Order order) {
        Customer customer = extractCustomer(order);
        if (customer == null) {
            return null;
        }

        String firstName = trimToNull(customer.getFirstName());
        String lastName = trimToNull(customer.getLastName());
        String fullName = (firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName);
        return trimToNull(fullName);
    }

    private String resolveCustomerEmail(Order order) {
        Customer customer = extractCustomer(order);
        return customer == null ? null : trimToNull(customer.getEmail());
    }

    private String resolveCustomerPhone(Order order) {
        Customer customer = extractCustomer(order);
        return customer == null ? null : trimToNull(customer.getPhoneNumber());
    }

    private String resolveCustomerAddress(Order order) {
        Customer customer = extractCustomer(order);
        if (customer == null) {
            return null;
        }

        String city = trimToNull(customer.getCity());
        String country = trimToNull(customer.getCountry());
        if (city == null) {
            return country;
        }
        if (country == null) {
            return city;
        }
        return city + ", " + country;
    }

    private Customer extractCustomer(Order order) {
        return order == null ? null : order.getCustomer();
    }

    private boolean isOrderPaid(Order order) {
        if (order == null || order.getCurrentStatus() == null) {
            return false;
        }

        return switch (order.getCurrentStatus()) {
            case PAID, PROCESSING, READY_TO_DELIVER, DELIVERY_IN_PROGRESS, DELIVERED, REFUNDED -> true;
            case PENDING, CANCELED -> false;
        };
    }

    private void syncLinkedOrder(Shipment shipment) {
        Optional<Order> orderOpt = findLinkedOrder(shipment);
        if (orderOpt.isEmpty()) {
            return;
        }

        Order order = orderOpt.get();
        updateOrderTracking(order, shipment);
        updateOrderStatus(order, shipment.getStatus());
        orderRepository.save(order);
        publishPartnerOrderChanged(order.getId());
    }

    private void updateOrderTracking(Order order, Shipment shipment) {
        String trackingId = trimToNull(shipment.getTrackingId());
        if (trackingId != null) {
            order.setTrackingNumber(trackingId);
        }

        if (shipment.getStatus() == ShipmentStatus.LIVREE) {
            order.setDeliveryDate(shipment.getDeliveredAt());
            return;
        }

        order.setDeliveryDate(null);
    }

    private void updateOrderStatus(Order order, ShipmentStatus shipmentStatus) {
        if (shipmentStatus == null) {
            return;
        }

        Status targetStatus = mapToOrderStatus(shipmentStatus);
        if (targetStatus == null) {
            return;
        }

        Status currentStatus = order.getCurrentStatus();
        if (currentStatus == Status.REFUNDED) {
            return;
        }

        if (currentStatus == targetStatus) {
            return;
        }

        order.setCurrentStatus(targetStatus);
        appendOrderHistory(order, targetStatus);
    }

    private void appendOrderHistory(Order order, Status status) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }

        order.getStatusHistory().add(StatusHistory.builder()
                .order(order)
                .status(status)
                .comment("Statut synchronisé depuis logistique back-office")
                .changedAt(LocalDateTime.now())
                .build());
    }

    private Status mapToOrderStatus(ShipmentStatus shipmentStatus) {
        return switch (shipmentStatus) {
            case EN_PREPARATION -> Status.READY_TO_DELIVER;
            case EN_COURS -> Status.DELIVERY_IN_PROGRESS;
            case LIVREE -> Status.DELIVERED;
            case ECHEC -> Status.CANCELED;
        };
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return 30;
        }
        return Math.max(1, Math.min(days, 365));
    }

    private double computeAverageDelayDays(LocalDateTime from) {
        List<Shipment> deliveredShipments = shipmentRepository
                .findByStatusAndCreatedAtGreaterThanEqualAndEtaIsNotNullAndDeliveredAtIsNotNull(
                        ShipmentStatus.LIVREE,
                        from
                );

        if (deliveredShipments.isEmpty()) {
            return 0d;
        }

        double delayDaysTotal = deliveredShipments.stream()
                .mapToDouble(this::computeShipmentDelayDays)
                .sum();

        return delayDaysTotal / deliveredShipments.size();
    }

    private double computeShipmentDelayDays(Shipment shipment) {
        LocalDateTime etaEndOfDay = shipment.getEta().atTime(23, 59, 59);
        long hours = ChronoUnit.HOURS.between(etaEndOfDay, shipment.getDeliveredAt());
        return hours / 24.0d;
    }

    private Long parseOrderId(String orderId) {
        String safeOrderId = trimToNull(orderId);
        if (safeOrderId == null) {
            throw new IllegalArgumentException("Commande introuvable");
        }

        try {
            return Long.parseLong(safeOrderId);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Commande introuvable");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return trimToNull(value) == null;
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
}
