package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.dto.CheckoutCartRequestDto;
import com.lifeevent.lid.order.dto.CheckoutCartSelectedRequestDto;
import com.lifeevent.lid.order.dto.CheckoutItemRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.dto.OrderItemDto;
import com.lifeevent.lid.order.dto.StatusHistoryDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.service.OrderService;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderArticleRepository orderArticleRepository;
    private final CartRepository cartRepository;
    private final CartArticleRepository cartArticleRepository;
    private final CustomerRepository customerRepository;
    private final StockRepository stockRepository;
    private final ArticleRepository articleRepository;

    @Override
    public CheckoutResponseDto checkoutCart(String customerId, CheckoutCartRequestDto request) {
        log.info("Checkout panier complet pour le client: {}", customerId);
        Customer customer = getRequiredCustomer(customerId);
        CheckoutData checkoutData = buildCartCheckoutData(customerId);
        return executeCheckout(customer, request, checkoutData.lines(), checkoutData.cartToClear());
    }

    @Override
    public CheckoutResponseDto checkoutSelectedArticles(String customerId, CheckoutCartSelectedRequestDto request) {
        log.info("Checkout articles sélectionnés pour le client: {}", customerId);
        Customer customer = getRequiredCustomer(customerId);
        List<CheckoutLine> lines = buildSelectedCheckoutLines(request);
        return executeCheckout(customer, request, lines, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderDetailDto> getOrderById(Long orderId) {
        log.info("Récupération de la commande: {}", orderId);
        return orderRepository.findById(orderId).map(this::mapToDetailDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDetailDto> getOrdersByCustomer(String customerId, int page, int size) {
        log.info("Récupération des commandes du client: {}", customerId);

        getRequiredCustomer(customerId);

        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomer_UserId(customerId, pageable)
                .stream()
                .map(this::mapToDetailDto)
                .toList();
    }

    @Override
    public void updateOrderStatus(Long orderId, Status newStatus, String comment) {
        log.info("Mise à jour du statut de la commande {}: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        appendStatusHistory(order, newStatus, comment);
        order.setCurrentStatus(newStatus);

        orderRepository.save(order);
    }

    @Override
    public void confirmPayment(Long orderId) {
        log.info("Confirmation du paiement pour la commande: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        if (order.getCurrentStatus() != Status.PENDING) {
            throw new IllegalArgumentException("La commande n'est pas en attente de paiement");
        }

        consumeReservedStocks(order);
        updateOrderStatus(orderId, Status.PAID, "Paiement confirmé");
    }

    @Override
    public void cancelOrder(Long orderId, String reason) {
        log.info("Annulation de la commande: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        if (order.getCurrentStatus() == Status.PENDING) {
            releaseReservedStocks(order);
        }
        updateOrderStatus(orderId, Status.CANCELED, reason);
    }

    private OrderDetailDto mapToDetailDto(Order order) {
        List<OrderItemDto> items = order.getArticles().stream()
                .map(oa -> OrderItemDto.builder()
                        .articleId(oa.getArticle().getId())
                        .articleName(oa.getArticle().getName())
                        .quantity(oa.getQuantity())
                        .priceAtOrder(oa.getPriceAtOrder())
                        .subtotal(oa.getPriceAtOrder() * oa.getQuantity())
                        .build())
                .toList();

        List<StatusHistoryDto> statusHistory = order.getStatusHistory().stream()
                .map(sh -> StatusHistoryDto.builder()
                        .id(sh.getId())
                        .status(sh.getStatus())
                        .comment(sh.getComment())
                        .changedAt(sh.getChangedAt())
                        .build())
                .toList();

        return OrderDetailDto.builder()
                .id(order.getId())
                .orderNumber("ORD-" + order.getId())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .currentStatus(order.getCurrentStatus())
                .createdAt(order.getCreatedAt())
                .deliveryDate(order.getDeliveryDate())
                .trackingNumber(order.getTrackingNumber())
                .items(items)
                .statusHistory(statusHistory)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOwnedByCurrentUser(Long orderId) {
        log.debug("Vérification de ownership pour la commande: {}", orderId);
        String currentUserId = SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {
            log.warn("Tentative de vérification d'ownership sans utilisateur authentifié");
            return false;
        }

        return orderRepository.findById(orderId)
                .map(order -> currentUserId.equals(order.getCustomer().getUserId()))
                .orElse(false);
    }

    private Customer getRequiredCustomer(String customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
    }

    private CheckoutResponseDto executeCheckout(Customer customer, CheckoutCartRequestDto request, List<CheckoutLine> lines, Cart cartToClear) {
        reserveStocks(lines);

        double totalAmount = calculateTotalAmount(lines);
        Order savedOrder = orderRepository.save(buildPendingOrder(customer, request.getCurrency(), totalAmount));

        List<OrderArticle> savedOrderArticles = orderArticleRepository.saveAll(buildOrderArticles(savedOrder, lines));
        savedOrder.setArticles(savedOrderArticles);
        appendStatusHistory(savedOrder, Status.PENDING, "Commande créée - En attente de paiement");
        orderRepository.save(savedOrder);

        clearCartIfNeeded(cartToClear);

        return CheckoutResponseDto.builder()
                .orderId(savedOrder.getId())
                .amount(totalAmount)
                .paymentUrl("https://paydunya.com/pay/placeholder")
                .invoiceToken("TOKEN-" + savedOrder.getId())
                .build();
    }

    private CheckoutData buildCartCheckoutData(String customerId) {
        Cart cart = cartRepository.findByCustomer_userId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        List<CheckoutLine> lines = cartItems.stream()
                .collect(Collectors.groupingBy(ca -> ca.getArticle().getId(),
                        Collectors.collectingAndThen(Collectors.toList(), groupedItems -> {
                            Article article = groupedItems.get(0).getArticle();
                            int totalQuantity = groupedItems.stream()
                                    .map(CartArticle::getQuantity)
                                    .mapToInt(this::normalizeQuantity)
                                    .sum();
                            return new CheckoutLine(article, totalQuantity, article.getPrice());
                        })))
                .values()
                .stream()
                .toList();

        return new CheckoutData(lines, cart);
    }

    private List<CheckoutLine> buildSelectedCheckoutLines(CheckoutCartSelectedRequestDto request) {
        if (request.getArticles() == null || request.getArticles().isEmpty()) {
            throw new IllegalArgumentException("La liste des articles sélectionnés est obligatoire");
        }

        Map<Long, Integer> quantitiesByArticleId = request.getArticles().stream()
                .peek(this::validateRequestedItem)
                .collect(Collectors.groupingBy(
                        CheckoutItemRequestDto::getArticleId,
                        Collectors.summingInt(item -> normalizeQuantity(item.getQuantity()))
                ));

        if (quantitiesByArticleId.isEmpty()) {
            throw new IllegalArgumentException("Aucun article fourni pour le checkout direct");
        }

        Map<Long, Article> articlesById = articleRepository.findAllById(quantitiesByArticleId.keySet()).stream()
                .collect(Collectors.toMap(Article::getId, article -> article));

        List<Long> missingArticleIds = quantitiesByArticleId.keySet().stream()
                .filter(articleId -> !articlesById.containsKey(articleId))
                .toList();

        if (!missingArticleIds.isEmpty()) {
            throw new ResourceNotFoundException("Article", "ids", missingArticleIds.toString());
        }

        return quantitiesByArticleId.entrySet().stream()
                .map(entry -> {
                    Article article = articlesById.get(entry.getKey());
                    return new CheckoutLine(article, entry.getValue(), article.getPrice());
                })
                .toList();
    }

    private void validateRequestedItem(CheckoutItemRequestDto item) {
        if (item.getArticleId() == null) {
            throw new IllegalArgumentException("articleId est obligatoire pour chaque ligne");
        }
        if (normalizeQuantity(item.getQuantity()) <= 0) {
            throw new IllegalArgumentException("La quantité doit être strictement positive");
        }
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null ? 1 : quantity;
    }

    private void reserveStocks(List<CheckoutLine> lines) {
        lines.forEach(line -> reserveStock(line.article().getId(), line.quantity()));
    }

    private double calculateTotalAmount(List<CheckoutLine> lines) {
        return lines.stream()
                .mapToDouble(line -> line.unitPrice() * line.quantity())
                .sum();
    }

    private Order buildPendingOrder(Customer customer, String currency, double amount) {
        return Order.builder()
                .customer(customer)
                .amount(amount)
                .currency(currency)
                .currentStatus(Status.PENDING)
                .statusHistory(new ArrayList<>())
                .articles(new ArrayList<>())
                .build();
    }

    private List<OrderArticle> buildOrderArticles(Order order, List<CheckoutLine> lines) {
        return lines.stream()
                .map(line -> (OrderArticle) OrderArticle.builder()
                        .order(order)
                        .article(line.article())
                        .quantity(line.quantity())
                        .priceAtOrder(line.unitPrice())
                        .build())
                .toList();
    }

    private void appendStatusHistory(Order order, Status status, String comment) {
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
    }

    private void clearCartIfNeeded(Cart cart) {
        if (cart != null) {
            cartArticleRepository.deleteByCart(cart);
        }
    }

    private void reserveStock(Long articleId, int quantity) {
        if (!stockRepository.existsByArticleId(articleId)) {
            throw new IllegalArgumentException("Stock introuvable pour l'article " + articleId);
        }
        int updated = stockRepository.reserveIfEnough(articleId, quantity);
        if (updated == 0) {
            throw new IllegalArgumentException("Stock insuffisant pour l'article " + articleId);
        }
    }

    private void releaseReservedStocks(Order order) {
        aggregateOrderQuantitiesByArticle(order).forEach(this::releaseReservedStock);
    }

    private void consumeReservedStocks(Order order) {
        aggregateOrderQuantitiesByArticle(order).forEach(this::consumeReservedStock);
    }

    private Map<Long, Integer> aggregateOrderQuantitiesByArticle(Order order) {
        return order.getArticles().stream()
                .collect(Collectors.groupingBy(
                        oa -> oa.getArticle().getId(),
                        Collectors.summingInt(oa -> normalizeQuantity(oa.getQuantity()))
                ));
    }

    private void releaseReservedStock(Long articleId, Integer quantity) {
        int updated = stockRepository.releaseReserved(articleId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour annulation, article " + articleId);
        }
    }

    private void consumeReservedStock(Long articleId, Integer quantity) {
        int updated = stockRepository.consumeReserved(articleId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour confirmation de paiement, article " + articleId);
        }
    }

    private record CheckoutLine(Article article, int quantity, double unitPrice) {
    }

    private record CheckoutData(List<CheckoutLine> lines, Cart cartToClear) {
    }
}
