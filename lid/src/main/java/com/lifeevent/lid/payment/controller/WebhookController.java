package com.lifeevent.lid.payment.controller;

import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.payment.service.PaydunyaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur pour gérer les webhooks/callbacks PayDunya
 * Reçoit les notifications instantanées de paiement (IPN)
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {
    
    private final PaymentService paymentService;
    private final PaydunyaSecurityService securityService;
    
    /**
     * Endpoint pour recevoir les notifications IPN de PayDunya
     * POST /api/v1/webhooks/paydunya
     * 
     * PayDunya envoie une requête POST avec les données du paiement
     * et un hash SHA-512 pour la sécurité
     */
    @PostMapping("/paydunya")
    public ResponseEntity<Map<String, String>> handlePaydunyaCallback(
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "hash", required = false) String hash,
            @RequestBody(required = false) Map<String, Object> payload) {
        
        log.info("Reçu un callback PayDunya avec le token: {}", token);

        if (hash != null && !securityService.isValidPaydunyaRequest(hash)) {
            log.warn("Callback PayDunya rejeté: hash invalide");
            return ResponseEntity.status(401).body(
                Map.of("error", "Invalid signature")
            );
        }

        if (token == null || token.isBlank()) {
            log.warn("Token manquant dans le callback PayDunya");
            return ResponseEntity.badRequest().body(
                Map.of("error", "Missing token")
            );
        }

        paymentService.processPaymentCallback(token);
        return ResponseEntity.ok(
            Map.of("status", "success", "message", "Callback processed successfully")
        );
    }
    
    /**
     * Health check pour le webhook
     * GET /api/v1/webhooks/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> webhookHealth() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
}
