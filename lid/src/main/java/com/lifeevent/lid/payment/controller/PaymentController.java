package com.lifeevent.lid.payment.controller;

import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentStatusResponseDto;
import com.lifeevent.lid.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Contrôleur REST pour les opérations de paiement
 * Endpoints pour créer, vérifier et gérer les paiements PayDunya
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    /**
     * Crée un nouveau paiement
     * POST /api/v1/payments
     */
    @PostMapping
    public ResponseEntity<PaymentResponseDto> createPayment(
            @Valid @RequestBody CreatePaymentRequestDto request) {
        log.info("Création d'un paiement pour la commande: {}", request.getOrderId());
        PaymentResponseDto payment = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }
    
    /**
     * Vérifie le statut d'un paiement via son token
     * GET /api/v1/payments/verify/{invoiceToken}
     */
    @GetMapping("/verify/{invoiceToken}")
    public ResponseEntity<PaymentStatusResponseDto> verifyPayment(
            @PathVariable String invoiceToken) {
        log.info("Vérification du statut du paiement: {}", invoiceToken);
        PaymentStatusResponseDto status = paymentService.verifyPaymentStatus(invoiceToken);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Récupère les détails d'un paiement
     * GET /api/v1/payments/{paymentId}
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDto> getPayment(
            @PathVariable Long paymentId) {
        log.info("Récupération du paiement: {}", paymentId);
        PaymentResponseDto payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(payment);
    }
    
    /**
     * Récupère tous les paiements d'une commande
     * GET /api/v1/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByOrder(
            @PathVariable Long orderId) {
        log.info("Récupération des paiements pour la commande: {}", orderId);
        List<PaymentResponseDto> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Récupère tous les paiements d'un client
     * GET /api/v1/payments/customer/{email}
     */
    @GetMapping("/customer/{email}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByCustomer(
            @PathVariable String email) {
        log.info("Récupération des paiements pour le client: {}", email);
        List<PaymentResponseDto> payments = paymentService.getPaymentsByCustomerEmail(email);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Annule un paiement en attente
     * DELETE /api/v1/payments/{paymentId}
     */
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> cancelPayment(
            @PathVariable Long paymentId) {
        log.info("Annulation du paiement: {}", paymentId);
        paymentService.cancelPayment(paymentId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Récupère les opérateurs disponibles pour un pays
     * GET /api/v1/payments/operators/{countryCode}
     */
    @GetMapping("/operators/{countryCode}")
    public ResponseEntity<List<String>> getAvailableOperators(
            @PathVariable String countryCode) {
        log.info("Récupération des opérateurs pour le pays: {}", countryCode);
        List<String> operators = paymentService.getAvailableOperators(countryCode);
        return ResponseEntity.ok(operators);
    }
}
