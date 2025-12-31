package com.lifeevent.lid.payment.service;

import com.lifeevent.lid.payment.dto.RefundRequestDto;
import com.lifeevent.lid.payment.dto.RefundResponseDto;

import java.util.List;

/**
 * Interface pour la gestion des remboursements
 */
public interface RefundService {
    
    /**
     * Crée une demande de remboursement pour un paiement
     */
    RefundResponseDto requestRefund(RefundRequestDto request);
    
    /**
     * Récupère les remboursements pour un paiement
     */
    List<RefundResponseDto> getRefundsByPaymentId(Long paymentId);
    
    /**
     * Récupère un remboursement spécifique
     */
    RefundResponseDto getRefundById(Long refundId);
    
    /**
     * Récupère tous les remboursements en attente
     */
    List<RefundResponseDto> getPendingRefunds();
    
    /**
     * Traite un remboursement (appel à l'API PayDunya)
     */
    void processRefund(Long refundId);
    
    /**
     * Annule un remboursement
     */
    void cancelRefund(Long refundId);
}
