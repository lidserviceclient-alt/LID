package com.lifeevent.lid.order.service;

import com.lifeevent.lid.order.dto.CheckoutRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.enumeration.Status;

import java.util.List;
import java.util.Optional;

/**
 * Service pour les commandes et le checkout
 */
public interface OrderService {
    
    /**
     * Initier un checkout : créer une commande et réserver le stock
     */
    CheckoutResponseDto checkout(String customerId, CheckoutRequestDto request);
    
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
