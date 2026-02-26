package com.lifeevent.lid.payment.controller;

import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.payment.service.PaydunyaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
     */
    @PostMapping("/paydunya")
    public ResponseEntity<Map<String, String>> handlePaydunyaCallback(
            @RequestParam(value = "token", required = false) String tokenParam,
            @RequestParam(value = "hash", required = false) String hashParam,
            @RequestHeader(value = "PAYDUNYA-HASH", required = false) String hashHeader,
            @RequestHeader(value = "X-PAYDUNYA-HASH", required = false) String hashAltHeader,
            @RequestBody(required = false) Map<String, Object> payload) {

        String token = firstNonBlank(
                tokenParam,
                stringValue(payload != null ? payload.get("token") : null),
                stringValue(payload != null ? payload.get("invoice_token") : null),
                stringValue(payload != null ? payload.get("invoiceToken") : null),
                stringValue(nested(payload, "data", "token")),
                stringValue(nested(payload, "data", "invoice", "token")),
                stringValue(nested(payload, "data", "invoice", "invoice_token"))
        );

        String hash = firstNonBlank(hashParam, hashHeader, hashAltHeader);

        log.info("Callback PayDunya reçu (token={}, hasPayload={})", token, payload != null);

        try {
            if (hash != null && !securityService.isValidPaydunyaRequest(hash)) {
                log.warn("Callback PayDunya rejeté: hash invalide");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid signature"));
            }

            if (token == null) {
                log.warn("Token manquant dans le callback PayDunya (keys={})", payload != null ? payload.keySet() : "null");
                return ResponseEntity.badRequest().body(Map.of("error", "Missing token"));
            }

            paymentService.processPaymentCallback(token);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Callback processed successfully"));
        } catch (Exception e) {
            log.error("Erreur lors du traitement du callback PayDunya (token={})", token, e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Error processing callback", "message", safeMessage(e))
            );
        }
    }

    /**
     * Health check pour le webhook
     * GET /api/v1/webhooks/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> webhookHealth() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }

    private static String safeMessage(Throwable e) {
        if (e == null) return "";
        String m = e.getMessage();
        return m == null ? "" : m;
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v == null) continue;
            String s = v.trim();
            if (!s.isBlank()) return s;
        }
        return null;
    }

    private static Object nested(Map<String, Object> payload, String... path) {
        if (payload == null || path == null || path.length == 0) return null;
        Object current = payload;
        for (String p : path) {
            if (!(current instanceof Map<?, ?> m)) return null;
            current = m.get(p);
        }
        return current;
    }
}
