package com.lifeevent.lid.backoffice.lid.order.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.backoffice.lid.order.dto.*;
import com.lifeevent.lid.backoffice.lid.order.enumeration.BackOfficeOrderStatus;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeOrderService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.discount.entity.Discount;
import com.lifeevent.lid.discount.enumeration.DiscountType;
import com.lifeevent.lid.discount.repository.DiscountRepository;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeOrderServiceImpl implements BackOfficeOrderService {

    private final OrderRepository orderRepository;
    private final OrderArticleRepository orderArticleRepository;
    private final CustomerRepository customerRepository;
    private final ArticleRepository articleRepository;
    private final DiscountRepository discountRepository;
    private final StockRepository stockRepository;
    private final ShipmentRepository shipmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeOrderSummaryDto> getOrders(Pageable pageable, BackOfficeOrderStatus status, String q) {
        return getAllCustomersOrders(pageable, status, q);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeOrderSummaryDto> getRecentOrders() {
        Page<BackOfficeOrderSummaryDto> firstPage = getAllCustomersOrders(PageRequest.of(0, 5), null, null);
        return firstPage.getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeOrderSummaryDto> getAllCustomersOrders(Pageable pageable, BackOfficeOrderStatus status, String q) {
        Status mappedStatus = mapToOrderStatus(status);
        String query = q == null ? "" : q.trim();
        // If numeric query, try direct ID match first
        if (!query.isEmpty() && query.matches("^\\d+$")) {
            Long id = Long.parseLong(query);
            Optional<Order> orderOpt = orderRepository.findById(id);
            if (orderOpt.isPresent()) {
                Order o = orderOpt.get();
                if (mappedStatus == null || o.getCurrentStatus() == mappedStatus) {
                    return new org.springframework.data.domain.PageImpl<>(List.of(toSummary(o)), pageable, 1);
                }
            }
        }
        return orderRepository.searchBackOffice(mappedStatus, query, pageable)
                .map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeOrderSummaryDto> getOrdersByCustomer(String customerId, Pageable pageable, BackOfficeOrderStatus status) {
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("customerId requis");
        }
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
        Status mappedStatus = mapToOrderStatus(status);
        return orderRepository.searchByCustomerBackOffice(customerId, mappedStatus, pageable)
                .map(this::toSummary);
    }

    @Override
    public BackOfficeOrderSummaryDto createOrder(BackOfficeCreateOrderRequest request) {
        if (request == null || request.getCustomerId() == null || request.getCustomerId().isBlank()) {
            throw new IllegalArgumentException("customerId requis");
        }
        List<BackOfficeOrderLineRequest> lines = request.getLines();
        if (lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException("Aucune ligne de commande");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        double subTotal = 0d;
        List<OrderArticle> orderArticles = new ArrayList<>();
        for (BackOfficeOrderLineRequest line : lines) {
            if (line == null || line.getProductId() == null || line.getQuantity() == null || line.getQuantity() <= 0) {
                continue;
            }
            Article article = articleRepository.findById(line.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(line.getProductId())));
            double price = article.getPrice() == null ? 0d : article.getPrice();
            int qty = Math.max(1, line.getQuantity());
            consumeStock(article.getId(), qty);
            subTotal += price * qty;
            orderArticles.add(OrderArticle.builder()
                    .article(article)
                    .quantity(qty)
                    .priceAtOrder(price)
                    .build());
        }
        if (orderArticles.isEmpty()) {
            throw new IllegalArgumentException("Lignes invalides");
        }

        Discount discount = resolveDiscount(request.getPromoCode());
        double discountAmount = computeDiscount(discount, subTotal);
        double total = Math.max(0d, subTotal - discountAmount);

        Order order = Order.builder()
                .customer(customer)
                .amount(total)
                .currency("FCF")
                .currentStatus(Status.PENDING)
                .statusHistory(new ArrayList<>())
                .articles(new ArrayList<>())
                .build();

        Order saved = orderRepository.save(order);

        for (OrderArticle oa : orderArticles) {
            oa.setOrder(saved);
            orderArticleRepository.save(oa);
            saved.getArticles().add(oa);
        }

        StatusHistory history = StatusHistory.builder()
                .order(saved)
                .status(Status.PENDING)
                .comment("Commande créée depuis back-office")
                .changedAt(LocalDateTime.now())
                .build();
        saved.getStatusHistory().add(history);
        orderRepository.save(saved);

        return toSummary(saved);
    }

    @Override
    public BackOfficeOrderSummaryDto updateStatus(Long orderId, BackOfficeOrderStatus status) {
        if (orderId == null) throw new IllegalArgumentException("orderId requis");
        if (status == null) throw new IllegalArgumentException("status requis");

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        Status mapped = mapToOrderStatus(status);
        if (mapped == null) throw new IllegalArgumentException("status invalide");

        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(mapped)
                .comment("Statut mis à jour depuis back-office")
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
        order.setCurrentStatus(mapped);
        Order saved = orderRepository.save(order);
        syncShipmentForOrderStatus(saved, status);
        return toSummary(saved);
    }

    private void syncShipmentForOrderStatus(Order order, BackOfficeOrderStatus status) {
        if (order == null || order.getId() == null || status == null) {
            return;
        }

        String orderId = String.valueOf(order.getId());
        Shipment shipment = findOrCreateShipment(orderId);

        switch (status) {
            case EXPEDIEE -> applyExpedieeShipmentState(shipment, orderId);
            case LIVREE -> applyLivreeShipmentState(shipment);
            case ANNULEE -> applyAnnuleeShipmentState(shipment);
            default -> {
                // No shipment side effect for CREEE/PAYEE/REMBOURSEE.
            }
        }

        if (shipment.getStatus() != null) {
            shipmentRepository.save(shipment);
        }
    }

    private Shipment findOrCreateShipment(String orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .orElseGet(() -> Shipment.builder().orderId(orderId).build());
    }

    private void applyExpedieeShipmentState(Shipment shipment, String orderId) {
        // Keep default handoff step for delivery app: "A recuperer" first.
        if (shipment.getStatus() == null || shipment.getStatus() == ShipmentStatus.ECHEC) {
            shipment.setStatus(ShipmentStatus.EN_PREPARATION);
        }
        if (isBlank(shipment.getTrackingId())) {
            shipment.setTrackingId("TRK-" + orderId);
        }
        if (isBlank(shipment.getCarrier())) {
            shipment.setCarrier("Transporteur");
        }
        if (shipment.getEta() == null) {
            shipment.setEta(LocalDate.now().plusDays(2));
        }
        shipment.setDeliveredAt(null);
    }

    private void applyLivreeShipmentState(Shipment shipment) {
        shipment.setStatus(ShipmentStatus.LIVREE);
        if (shipment.getDeliveredAt() == null) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }
    }

    private void applyAnnuleeShipmentState(Shipment shipment) {
        shipment.setStatus(ShipmentStatus.ECHEC);
        shipment.setDeliveredAt(null);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeOrderQuoteResponse quote(BackOfficeCreateOrderRequest request) {
        List<BackOfficeOrderLineRequest> lines = request == null ? null : request.getLines();
        if (lines == null || lines.isEmpty()) {
            return BackOfficeOrderQuoteResponse.builder()
                    .subTotal(0d)
                    .discountAmount(0d)
                    .total(0d)
                    .promoApplied(false)
                    .promoCode("")
                    .promoMessage("")
                    .build();
        }

        double subTotal = 0d;
        for (BackOfficeOrderLineRequest line : lines) {
            if (line == null || line.getProductId() == null || line.getQuantity() == null || line.getQuantity() <= 0) {
                continue;
            }
            Article article = articleRepository.findById(line.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(line.getProductId())));
            double price = article.getPrice() == null ? 0d : article.getPrice();
            subTotal += price * Math.max(1, line.getQuantity());
        }

        Discount discount = resolveDiscount(request.getPromoCode());
        double discountAmount = computeDiscount(discount, subTotal);
        boolean applied = discount != null && discountAmount > 0d;
        double total = Math.max(0d, subTotal - discountAmount);

        return BackOfficeOrderQuoteResponse.builder()
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .total(total)
                .promoApplied(applied)
                .promoCode(request != null ? request.getPromoCode() : "")
                .promoMessage(applied ? "Code promo appliqué" : "Code promo non appliqué")
                .build();
    }

    private BackOfficeOrderSummaryDto toSummary(Order order) {
        String customerLabel = "-";
        if (order.getCustomer() != null) {
            String first = order.getCustomer().getFirstName() == null ? "" : order.getCustomer().getFirstName();
            String last = order.getCustomer().getLastName() == null ? "" : order.getCustomer().getLastName();
            String email = order.getCustomer().getEmail() == null ? "" : order.getCustomer().getEmail();
            String full = (first + " " + last).trim();
            customerLabel = full.isEmpty() ? email : (email.isEmpty() ? full : full + " • " + email);
        }

        int itemsCount = 0;
        if (order.getArticles() != null) {
            for (OrderArticle oa : order.getArticles()) {
                if (oa != null && oa.getQuantity() != null) {
                    itemsCount += oa.getQuantity();
                }
            }
        }

        return BackOfficeOrderSummaryDto.builder()
                .id(order.getId())
                .customer(customerLabel)
                .items(itemsCount)
                .total(order.getAmount())
                .status(mapToBackOfficeStatus(order.getCurrentStatus()))
                .dateCreation(order.getCreatedAt())
                .build();
    }

    private Status mapToOrderStatus(BackOfficeOrderStatus status) {
        if (status == null) return null;
        return switch (status) {
            case CREEE -> Status.PENDING;
            case PAYEE -> Status.PAID;
            case EXPEDIEE -> Status.DELIVERY_IN_PROGRESS;
            case LIVREE -> Status.DELIVERED;
            case ANNULEE -> Status.CANCELED;
            case REMBOURSEE -> Status.REFUNDED;
        };
    }

    private BackOfficeOrderStatus mapToBackOfficeStatus(Status status) {
        if (status == null) return BackOfficeOrderStatus.CREEE;
        return switch (status) {
            case PENDING -> BackOfficeOrderStatus.CREEE;
            case PAID -> BackOfficeOrderStatus.PAYEE;
            case PROCESSING -> BackOfficeOrderStatus.CREEE;
            case READY_TO_DELIVER -> BackOfficeOrderStatus.EXPEDIEE;
            case DELIVERY_IN_PROGRESS -> BackOfficeOrderStatus.EXPEDIEE;
            case DELIVERED -> BackOfficeOrderStatus.LIVREE;
            case CANCELED -> BackOfficeOrderStatus.ANNULEE;
            case REFUNDED -> BackOfficeOrderStatus.REMBOURSEE;
        };
    }

    private Discount resolveDiscount(String code) {
        if (code == null || code.trim().isEmpty()) return null;
        return discountRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
    }

    private double computeDiscount(Discount discount, double subTotal) {
        if (discount == null) return 0d;
        if (discount.getType() == DiscountType.FIXED) {
            return Math.min(subTotal, discount.getValue() == null ? 0d : discount.getValue());
        }
        double percent = discount.getValue() == null ? 0d : discount.getValue();
        return subTotal * (percent / 100.0);
    }

    private void consumeStock(Long articleId, int quantity) {
        if (!stockRepository.existsByArticleId(articleId)) {
            throw new IllegalArgumentException("Stock introuvable pour l'article " + articleId);
        }
        int updated = stockRepository.decrementAvailableIfEnough(articleId, quantity);
        if (updated == 0) {
            throw new IllegalArgumentException("Stock insuffisant pour l'article " + articleId);
        }
    }
}
