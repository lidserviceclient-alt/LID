package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentItemDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentTaxDto;
import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.order.dto.*;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
    private final ArticleRepository articleRepository;
    private final PaymentService paymentService;
    private final PaydunyaProperties paydunyaProperties;
    
    @Override
    public CheckoutResponseDto checkout(String customerId, CheckoutRequestDto request) {
        log.info("Initiation du checkout pour le client: {}", customerId);
        
        // Vérifier le client
        Customer customer = customerRepository.findById(customerId).orElseGet(() -> {
            String email = request.getEmail();
            if (email == null || email.isBlank()) {
                email = customerId + "@unknown.local";
            }
            Customer created = Customer.builder()
                    .userId(customerId)
                    .email(email)
                    .emailVerified(false)
                    .build();
            return customerRepository.save(created);
        });

        List<OrderArticle> orderArticles = new ArrayList<>();
        double computedAmount = 0d;
        String currency = (request.getCurrency() == null || request.getCurrency().isBlank()) ? "XOF" : request.getCurrency();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CheckoutItemDto item : request.getItems()) {
                Long articleId = item == null ? null : item.getArticleId();
                int qty = item == null || item.getQuantity() == null ? 0 : item.getQuantity();
                if (articleId == null || qty <= 0) continue;
                Article article = articleRepository.findById(articleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(articleId)));
                double unit = article.getPrice() == null ? 0d : article.getPrice();
                computedAmount += unit * qty;
                OrderArticle oa = OrderArticle.builder()
                        .article(article)
                        .quantity(qty)
                        .priceAtOrder(unit)
                        .build();
                orderArticles.add(oa);
            }
        } else {
            Cart cart = cartRepository.findByCustomer_userId(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
            List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("Le panier est vide");
            }
            for (CartArticle cartItem : cartItems) {
                double unit = cartItem.getArticle().getPrice() == null ? 0d : cartItem.getArticle().getPrice();
                computedAmount += unit * cartItem.getQuantity();
                OrderArticle oa = OrderArticle.builder()
                        .article(cartItem.getArticle())
                        .quantity(cartItem.getQuantity())
                        .priceAtOrder(unit)
                        .build();
                orderArticles.add(oa);
            }
            cartArticleRepository.deleteByCart(cart);
        }

        if (orderArticles.isEmpty() || computedAmount <= 0d) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        Order order = Order.builder()
            .customer(customer)
            .amount(computedAmount)
            .currency(currency)
            .currentStatus(Status.PENDING)
            .statusHistory(new ArrayList<>())
            .articles(new ArrayList<>())
            .build();
        
        Order savedOrder = orderRepository.save(order);
        
        for (OrderArticle oa : orderArticles) {
            oa.setOrder(savedOrder);
            orderArticleRepository.save(oa);
            savedOrder.getArticles().add(oa);
        }
        
        // Ajouter un statut à l'historique
        StatusHistory history = StatusHistory.builder()
            .order(savedOrder)
            .status(Status.PENDING)
            .comment("Commande créée - En attente de paiement")
            .changedAt(LocalDateTime.now())
            .build();
        savedOrder.getStatusHistory().add(history);
        
        orderRepository.save(savedOrder);

        String fullName = java.util.stream.Stream.of(customer.getFirstName(), customer.getLastName())
                .filter(v -> v != null && !v.isBlank())
                .collect(Collectors.joining(" "));
        if (fullName.isBlank()) fullName = customer.getEmail();
        String email = request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail() : customer.getEmail();
        String phone = request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone() : "+225000000000";

        List<PaymentItemDto> paymentItems = savedOrder.getArticles().stream()
                .map(oa -> PaymentItemDto.builder()
                        .name(oa.getArticle().getName())
                        .quantity(oa.getQuantity())
                        .unitPrice(BigDecimal.valueOf(oa.getPriceAtOrder()))
                        .totalPrice(BigDecimal.valueOf(oa.getPriceAtOrder() * oa.getQuantity()))
                        .description(oa.getArticle().getDescription())
                        .build())
                .toList();

        PaymentTaxDto tva = PaymentTaxDto.builder()
                .name("TVA (18%)")
                .amount(BigDecimal.valueOf(Math.round(savedOrder.getAmount() - (savedOrder.getAmount() / 1.18d))))
                .build();

        String returnUrl = request.getReturnUrl() != null && !request.getReturnUrl().isBlank()
                ? request.getReturnUrl()
                : paydunyaProperties.getReturnUrl();
        String cancelUrl = request.getCancelUrl() != null && !request.getCancelUrl().isBlank()
                ? request.getCancelUrl()
                : paydunyaProperties.getCancelUrl();

        PaymentResponseDto payment = paymentService.createPayment(CreatePaymentRequestDto.builder()
                .orderId(savedOrder.getId())
                .amount(BigDecimal.valueOf(savedOrder.getAmount()))
                .description("Paiement commande ORD-" + savedOrder.getId())
                .operator(PaymentOperator.CARD_CI)
                .customerName(fullName)
                .customerEmail(email)
                .customerPhone(phone)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(paymentItems)
                .taxes(List.of(tva))
                .build());

        return CheckoutResponseDto.builder()
                .orderId(savedOrder.getId())
                .amount(savedOrder.getAmount())
                .paymentUrl(payment.getPaymentUrl())
                .invoiceToken(payment.getInvoiceToken())
                .build();
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
        
        // Vérifier le client
        customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomer_UserId(customerId, pageable)
            .stream()
            .map(this::mapToDetailDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public void updateOrderStatus(Long orderId, Status newStatus, String comment) {
        log.info("Mise à jour du statut de la commande {}: {}", orderId, newStatus);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Ajouter à l'historique
        StatusHistory history = StatusHistory.builder()
            .order(order)
            .status(newStatus)
            .comment(comment)
            .changedAt(LocalDateTime.now())
            .build();
        
        order.getStatusHistory().add(history);
        order.setCurrentStatus(newStatus);
        
        orderRepository.save(order);
    }
    
    @Override
    public void confirmPayment(Long orderId) {
        log.info("Confirmation du paiement pour la commande: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Vérifier le statut actuel
        if (order.getCurrentStatus() != Status.PENDING) {
            throw new IllegalArgumentException("La commande n'est pas en attente de paiement");
        }
        
        // Mettre à jour le statut
        updateOrderStatus(orderId, Status.PAID, "Paiement confirmé");
    }
    
    @Override
    public void cancelOrder(Long orderId, String reason) {
        log.info("Annulation de la commande: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Mettre à jour le statut
        updateOrderStatus(orderId, Status.CANCELED, reason);
    }
    
    /**
     * Mapper une entité Order vers un DTO OrderDetailDto
     */
    private OrderDetailDto mapToDetailDto(Order order) {
        List<OrderItemDto> items = order.getArticles().stream()
            .map(oa -> OrderItemDto.builder()
                .articleId(oa.getArticle().getId())
                .articleName(oa.getArticle().getName())
                .quantity(oa.getQuantity())
                .priceAtOrder(oa.getPriceAtOrder())
                .subtotal(oa.getPriceAtOrder() * oa.getQuantity())
                .build())
            .collect(Collectors.toList());
        
        List<StatusHistoryDto> statusHistory = order.getStatusHistory().stream()
            .map(sh -> StatusHistoryDto.builder()
                .id(sh.getId())
                .status(sh.getStatus())
                .comment(sh.getComment())
                .changedAt(sh.getChangedAt())
                .build())
            .collect(Collectors.toList());
        
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
}
