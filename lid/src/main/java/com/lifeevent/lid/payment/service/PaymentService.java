package com.lifeevent.lid.payment.service;

import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentStatusResponseDto;

import java.util.List;

/**
 * Interface pour la gestion des paiements PayDunya
 */
public interface PaymentService {
    
    /**
     * Crée une facture de paiement et retourne l'URL de redirection PayDunya
     */
    PaymentResponseDto createPayment(CreatePaymentRequestDto request);

    PaymentResponseDto createLocalPayment(CreatePaymentRequestDto request);
    
    /**
     * Vérifie le statut d'un paiement via le token
     */
    PaymentStatusResponseDto verifyPaymentStatus(String invoiceToken);
    
    /**
     * Récupère les détails d'un paiement par ID
     */
    PaymentResponseDto getPaymentById(Long paymentId);
    
    /**
     * Récupère tous les paiements pour une commande
     */
    List<PaymentResponseDto> getPaymentsByOrderId(Long orderId);
    
    /**
     * Récupère tous les paiements pour un client
     */
    List<PaymentResponseDto> getPaymentsByCustomerEmail(String customerEmail);
    
    /**
     * Traite le callback de PayDunya (IPN - Instant Payment Notification)
     */
    void processPaymentCallback(String invoiceToken);
    
    /**
     * Annule un paiement en attente
     */
    void cancelPayment(Long paymentId);
    
    /**
     * Obtient les opérateurs disponibles pour un pays
     */
    List<String> getAvailableOperators(String countryCode);
}
