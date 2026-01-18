package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
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
    
    @Override
    public CheckoutResponseDto checkout(String customerId, CheckoutRequestDto request) {
        log.info("Initiation du checkout pour le client: {}", customerId);
        
        // Vérifier le client
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        // Récupérer le panier
        Cart cart = cartRepository.findByCustomer_userId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
        
        List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
        
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Le panier est vide");
        }
        
        // Créer la commande
        Order order = Order.builder()
            .customer(customer)
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .currentStatus(Status.PENDING)
            .statusHistory(new ArrayList<>())
            .articles(new ArrayList<>())
            .build();
        
        Order savedOrder = orderRepository.save(order);
        
        // Ajouter les articles de la commande
        for (CartArticle cartItem : cartItems) {
            OrderArticle orderArticle = OrderArticle.builder()
                .order(savedOrder)
                .article(cartItem.getArticle())
                .quantity(cartItem.getQuantity())
                .priceAtOrder(cartItem.getArticle().getPrice())
                .build();
            
            orderArticleRepository.save(orderArticle);
            savedOrder.getArticles().add(orderArticle);
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
        
        // Vider le panier après le checkout
        cartArticleRepository.deleteByCart(cart);
        
        return CheckoutResponseDto.builder()
            .orderId(savedOrder.getId())
            .amount(request.getAmount())
            .paymentUrl("https://paydunya.com/pay/placeholder")
            .invoiceToken("TOKEN-" + savedOrder.getId())
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
}
