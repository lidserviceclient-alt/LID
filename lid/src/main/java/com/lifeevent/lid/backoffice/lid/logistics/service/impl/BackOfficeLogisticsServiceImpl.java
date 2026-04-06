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
import com.lifeevent.lid.common.service.EmailService;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.realtime.service.RealtimeEventPublisher;
import com.lifeevent.lid.user.customer.entity.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
    private final EmailService emailService;
    private final RealtimeEventPublisher realtimeEventPublisher;

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
        Pageable safePageable = ensureDefaultSort(pageable);
        Page<Shipment> shipments = shipmentRepository.search(status, carrier, q, safePageable);
        Map<Long, Order> ordersById = loadOrdersByShipmentOrderIds(shipments.getContent(), false);
        List<BackOfficeShipmentDto> content = shipments.getContent().stream()
                .map(shipment -> toShipmentDto(shipment, resolveOrderForShipment(shipment, ordersById)))
                .toList();
        return new PageImpl<>(content, safePageable, shipments.getTotalElements());
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
        publishShipmentRealtime(saved, "upsert");
        return toShipmentDto(saved, findLinkedOrder(saved).orElse(null));
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
        publishShipmentRealtime(saved, "status_update");
        return toShipmentDto(saved, findLinkedOrder(saved).orElse(null));
    }

    @Override
    public BackOfficeShipmentDetailDto scanShipment(BackOfficeShipmentScanRequest request, String scannedBy) {
        if (request == null || isBlank(request.getQr())) {
            throw new IllegalArgumentException("QR requis");
        }

        Shipment shipment = resolveShipmentFromQr(request.getQr())
                .orElseThrow(() -> new IllegalArgumentException("Expedition introuvable"));
        Optional<Order> linkedOrder = findLinkedOrder(shipment);
        ensureOrderIsReadyForTransit(linkedOrder);

        if (shipment.getStatus() == ShipmentStatus.LIVREE) {
            throw new IllegalArgumentException("Commande déjà livrée");
        }

        boolean alreadyInTransit = shipment.getStatus() == ShipmentStatus.EN_COURS;
        fillCourierData(shipment, request, scannedBy);
        if (shipment.getStatus() != ShipmentStatus.EN_COURS) {
            shipment.setStatus(ShipmentStatus.EN_COURS);
            shipment.setDeliveredAt(null);
            shipment.setScannedAt(LocalDateTime.now());
        } else if (shipment.getScannedAt() == null) {
            shipment.setScannedAt(LocalDateTime.now());
        }

        boolean codeGenerated = ensureDeliveryCode(shipment);

        Shipment saved = shipmentRepository.save(shipment);
        syncLinkedOrder(saved, linkedOrder.orElse(null));
        sendDeliveryCodeIfNeeded(saved, codeGenerated, alreadyInTransit, linkedOrder.orElse(null));
        publishShipmentRealtime(saved, "scan");
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
        publishShipmentRealtime(saved, "delivery_confirm");
        return toShipmentDto(saved, findLinkedOrder(saved).orElse(null));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeShipmentDetailDto> getShipmentDetailsByIds(List<Long> ids) {
        List<Long> safeIds = normalizeIds(ids);
        if (safeIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Shipment> shipmentsById = new HashMap<>();
        for (Shipment shipment : shipmentRepository.findAllById(safeIds)) {
            if (shipment != null && shipment.getId() != null) {
                shipmentsById.put(shipment.getId(), shipment);
            }
        }

        Map<Long, Order> ordersById = loadOrdersByShipmentOrderIds(new ArrayList<>(shipmentsById.values()), true);
        List<BackOfficeShipmentDetailDto> details = new ArrayList<>();
        for (Long id : safeIds) {
            Shipment shipment = shipmentsById.get(id);
            if (shipment == null) {
                continue;
            }
            details.add(toDetail(shipment, resolveOrderForShipment(shipment, ordersById)));
        }
        return details;
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
        if (normalized.startsWith("ship:")) {
            return findShipmentByIdToken(token.substring("ship:".length()));
        }
        if (normalized.startsWith("id:")) {
            return findShipmentByIdToken(token.substring("id:".length()));
        }
        if (normalized.startsWith("order:")) {
            return findShipmentByOrderToken(token.substring("order:".length()));
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

        Optional<Shipment> byOrderToken = findShipmentByOrderToken(token);
        if (byOrderToken.isPresent()) {
            return byOrderToken;
        }

        return findShipmentByIdToken(token);
    }

    private Optional<Shipment> findShipmentByOrderToken(String rawValue) {
        String value = trimToNull(rawValue);
        if (value == null) {
            return Optional.empty();
        }
        Optional<Shipment> direct = shipmentRepository.findByOrderId(value);
        if (direct.isPresent()) {
            return direct;
        }
        String digits = value.replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return Optional.empty();
        }
        return shipmentRepository.findByOrderId(digits);
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

    private boolean ensureDeliveryCode(Shipment shipment) {
        if (!isBlank(shipment.getDeliveryCode())) {
            return false;
        }

        shipment.setDeliveryCode(generate4DigitCode());
        shipment.setDeliveryCodeGeneratedAt(LocalDateTime.now());
        return true;
    }

    private void ensureOrderIsReadyForTransit(Optional<Order> linkedOrder) {
        if (linkedOrder == null || linkedOrder.isEmpty()) {
            return;
        }
        Status currentStatus = linkedOrder.get().getCurrentStatus();
        if (currentStatus == null) {
            throw new IllegalArgumentException("Commande non expédiée");
        }
        if (currentStatus != Status.READY_TO_DELIVER && currentStatus != Status.DELIVERY_IN_PROGRESS) {
            throw new IllegalArgumentException("Commande non expédiée");
        }
    }

    private void sendDeliveryCodeIfNeeded(Shipment shipment, boolean codeGenerated, boolean alreadyInTransit, Order linkedOrder) {
        if (!codeGenerated && alreadyInTransit) {
            return;
        }
        if (linkedOrder == null || linkedOrder.getCustomer() == null) {
            return;
        }
        String email = trimToNull(linkedOrder.getCustomer().getEmail());
        String code = trimToNull(shipment.getDeliveryCode());
        if (email == null || code == null) {
            return;
        }
        String orderLabel = "ORD-" + linkedOrder.getId();
        String subject = "Votre code de livraison LID";
        String body = "Commande " + orderLabel + " - code de remise: " + code;
        try {
            emailService.send(email, subject, body);
        } catch (Exception ex) {
            log.warn("Impossible d'envoyer le code de livraison pour shipmentId={}", shipment.getId(), ex);
        }
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
        return toDetail(shipment, findLinkedOrder(shipment).orElse(null));
    }

    private BackOfficeShipmentDetailDto toDetail(Shipment shipment, Order order) {

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

    private BackOfficeShipmentDto toShipmentDto(Shipment shipment, Order order) {
        return BackOfficeShipmentDto.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .carrier(shipment.getCarrier())
                .trackingId(shipment.getTrackingId())
                .status(shipment.getStatus())
                .eta(shipment.getEta())
                .cost(shipment.getCost())
                .customerName(resolveCustomerName(order))
                .customerPhone(resolveCustomerPhone(order))
                .customerAddress(resolveCustomerAddress(order))
                .customerEmail(resolveCustomerEmail(order))
                .scannedAt(shipment.getScannedAt())
                .courierName(shipment.getCourierName())
                .courierReference(shipment.getCourierReference())
                .build();
    }

    private Map<Long, Order> loadOrdersByShipmentOrderIds(List<Shipment> shipments, boolean withItems) {
        List<Long> orderIds = new ArrayList<>();
        if (shipments != null) {
            for (Shipment shipment : shipments) {
                Long orderId = parseOrderIdOrNull(shipment == null ? null : shipment.getOrderId());
                if (orderId != null) {
                    orderIds.add(orderId);
                }
            }
        }
        if (orderIds.isEmpty()) {
            return Map.of();
        }

        List<Order> orders = withItems
                ? orderRepository.findWithCustomerAndArticlesByIdIn(orderIds)
                : orderRepository.findWithCustomerByIdIn(orderIds);
        Map<Long, Order> byId = new HashMap<>();
        for (Order order : orders) {
            if (order != null && order.getId() != null) {
                byId.put(order.getId(), order);
            }
        }
        return byId;
    }

    private Order resolveOrderForShipment(Shipment shipment, Map<Long, Order> ordersById) {
        if (shipment == null || ordersById == null || ordersById.isEmpty()) {
            return null;
        }
        Long orderId = parseOrderIdOrNull(shipment.getOrderId());
        return orderId == null ? null : ordersById.get(orderId);
    }

    private Pageable ensureDefaultSort(Pageable pageable) {
        if (pageable == null) {
            return Pageable.unpaged();
        }
        if (pageable.getSort().isSorted()) {
            return pageable;
        }
        return org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        LinkedHashSet<Long> orderedUnique = new LinkedHashSet<>();
        for (Long id : ids) {
            if (id != null && id > 0L) {
                orderedUnique.add(id);
            }
        }
        return new ArrayList<>(orderedUnique);
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
            case PAID, PROCESSING, READY_TO_DELIVER, DELIVERY_IN_PROGRESS, DELIVERY_FAILED, DELIVERED, REFUNDED -> true;
            case PENDING, CANCELED -> false;
        };
    }

    private void syncLinkedOrder(Shipment shipment) {
        syncLinkedOrder(shipment, null);
    }

    private void syncLinkedOrder(Shipment shipment, Order preloadedOrder) {
        Order order = preloadedOrder;
        if (order == null) {
            Optional<Order> orderOpt = findLinkedOrder(shipment);
            if (orderOpt.isEmpty()) {
                return;
            }
            order = orderOpt.get();
        }
        if (order == null) {
            return;
        }
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

        Status targetStatus = mapShipmentStatusToOrderStatus(shipmentStatus);
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

        if (!canTransitionOrderStatus(currentStatus, targetStatus)) {
            return;
        }

        order.setCurrentStatus(targetStatus);
        appendOrderHistory(order, targetStatus, buildOrderHistoryComment(targetStatus));
    }

    private boolean canTransitionOrderStatus(Status currentStatus, Status targetStatus) {
        if (currentStatus == null) {
            return true;
        }

        if (targetStatus == Status.CANCELED) {
            return currentStatus != Status.DELIVERED && currentStatus != Status.CANCELED;
        }

        if (currentStatus == Status.DELIVERY_FAILED && targetStatus == Status.DELIVERY_IN_PROGRESS) {
            return true;
        }

        return rankOrderStatus(targetStatus) > rankOrderStatus(currentStatus);
    }

    private void appendOrderHistory(Order order, Status status, String comment) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }

        order.getStatusHistory().add(StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedAt(LocalDateTime.now())
                .build());
    }

    private String buildOrderHistoryComment(Status status) {
        if (status == Status.DELIVERY_FAILED) {
            return "Tentative de livraison échouée";
        }
        return "Statut synchronisé depuis logistique back-office";
    }

    private Status mapShipmentStatusToOrderStatus(ShipmentStatus shipmentStatus) {
        return switch (shipmentStatus) {
            case EN_PREPARATION -> Status.PROCESSING;
            case EN_COURS -> Status.DELIVERY_IN_PROGRESS;
            case LIVREE -> Status.DELIVERED;
            case ECHEC -> Status.DELIVERY_FAILED;
        };
    }

    private int rankOrderStatus(Status status) {
        if (status == null) {
            return -1;
        }
        return switch (status) {
            case PENDING -> 0;
            case PAID -> 1;
            case PROCESSING -> 2;
            case READY_TO_DELIVER -> 3;
            case DELIVERY_IN_PROGRESS -> 4;
            case DELIVERY_FAILED -> 5;
            case DELIVERED -> 6;
            case CANCELED -> 7;
            case REFUNDED -> 8;
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

    private Long parseOrderIdOrNull(String orderId) {
        String safeOrderId = trimToNull(orderId);
        if (safeOrderId == null) {
            return null;
        }
        try {
            return Long.parseLong(safeOrderId);
        } catch (NumberFormatException ex) {
            return null;
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

    private void publishShipmentRealtime(Shipment shipment, String trigger) {
        if (shipment == null) {
            return;
        }
        realtimeEventPublisher.publishDeliveryShipmentUpdated(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getStatus() == null ? null : shipment.getStatus().name(),
                shipment.getCarrier(),
                trigger
        );
        realtimeEventPublisher.publishBackofficeOverviewUpdated("shipment:" + trigger);
    }
}
