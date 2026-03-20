package com.lifeevent.lid.order.service;

import com.lifeevent.lid.order.dto.CheckoutCartRequestDto;
import com.lifeevent.lid.order.dto.CheckoutCartSelectedRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderQuoteResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.enumeration.Status;

import java.util.List;
import java.util.Optional;

/**
 * Service pour les commandes et le checkout
 */
public interface OrderService {
    
    /**
     * Valider le panier complet du client
     */
    CheckoutResponseDto checkoutCart(String customerId, CheckoutCartRequestDto request);

    /**
     * Simuler le checkout (promo/fidélité) sans créer de commande
     */
    OrderQuoteResponseDto checkoutQuote(String customerId, CheckoutCartRequestDto request);

    /**
     * Valider une sélection d'articles fournie dans la requête
     */
    CheckoutResponseDto checkoutSelectedArticles(String customerId, CheckoutCartSelectedRequestDto request);
    
    /**
     * Récupérer une commande par ID
     */
    Optional<OrderDetailDto> getOrderById(Long orderId);
    
    /**
     * Récupérer les commandes d'un client avec pagination
     */
    List<OrderDetailDto> getOrdersByCustomer(String customerId, int page, int size);
    
    /**
     * Changer le statut d'une commande
     */
    void updateOrderStatus(Long orderId, Status newStatus, String comment);
    
    /**
     * Confirmer le paiement (après webhook PayDunya)
     */
    void confirmPayment(Long orderId);
    
    /**
     * Annuler une commande
     */
    void cancelOrder(Long orderId, String reason);
    
    /**
     * Vérifier si la commande appartient à l'utilisateur courant (CUSTOMER)
     * Utilisé pour les vérifications d'ownership dans @PreAuthorize
     */
    boolean isOwnedByCurrentUser(Long orderId);
}
