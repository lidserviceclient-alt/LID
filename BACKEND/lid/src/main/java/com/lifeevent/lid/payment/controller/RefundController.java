package com.lifeevent.lid.payment.controller;

import com.lifeevent.lid.payment.dto.RefundRequestDto;
import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Contrôleur REST pour les opérations de remboursement
 * Endpoints pour créer et gérer les remboursements
 */
@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
@Slf4j
public class RefundController {
    
    private final RefundService refundService;
    
    /**
     * Crée une demande de remboursement
     * POST /api/v1/refunds
     */
    @PostMapping
    public ResponseEntity<RefundResponseDto> requestRefund(
            @Valid @RequestBody RefundRequestDto request) {
        log.info("Demande de remboursement pour le paiement: {}", request.getPaymentId());
        RefundResponseDto refund = refundService.requestRefund(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(refund);
    }
    
    /**
     * Récupère un remboursement spécifique
     * GET /api/v1/refunds/{refundId}
     */
    @GetMapping("/{refundId}")
    public ResponseEntity<RefundResponseDto> getRefund(
            @PathVariable Long refundId) {
        log.info("Récupération du remboursement: {}", refundId);
        RefundResponseDto refund = refundService.getRefundById(refundId);
        return ResponseEntity.ok(refund);
    }
    
    /**
     * Récupère tous les remboursements d'un paiement
     * GET /api/v1/refunds/payment/{paymentId}
     */
    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<List<RefundResponseDto>> getRefundsByPayment(
            @PathVariable Long paymentId) {
        log.info("Récupération des remboursements pour le paiement: {}", paymentId);
        List<RefundResponseDto> refunds = refundService.getRefundsByPaymentId(paymentId);
        return ResponseEntity.ok(refunds);
    }
    
    /**
     * Récupère tous les remboursements en attente
     * GET /api/v1/refunds/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<RefundResponseDto>> getPendingRefunds() {
        log.info("Récupération des remboursements en attente");
        List<RefundResponseDto> refunds = refundService.getPendingRefunds();
        return ResponseEntity.ok(refunds);
    }
    
    /**
     * Traite un remboursement
     * POST /api/v1/refunds/{refundId}/process
     */
    @PostMapping("/{refundId}/process")
    public ResponseEntity<Void> processRefund(
            @PathVariable Long refundId) {
        log.info("Traitement du remboursement: {}", refundId);
        refundService.processRefund(refundId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Annule un remboursement
     * DELETE /api/v1/refunds/{refundId}
     */
    @DeleteMapping("/{refundId}")
    public ResponseEntity<Void> cancelRefund(
            @PathVariable Long refundId) {
        log.info("Annulation du remboursement: {}", refundId);
        refundService.cancelRefund(refundId);
        return ResponseEntity.noContent().build();
    }
}
