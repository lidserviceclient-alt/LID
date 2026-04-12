package com.lifeevent.lid.payment.disbursement.service.impl;

import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementResult;
import com.lifeevent.lid.payment.disbursement.service.PaydunyaDisbursementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaydunyaDisbursementServiceImpl implements PaydunyaDisbursementService {

    private static final String DEFAULT_BASE_URL = "https://app.paydunya.com";

    private final PaydunyaProperties properties;
    private final RestTemplate restTemplate;

    @Override
    public PaydunyaDisbursementResult disburse(String accountAlias, BigDecimal amount, String withdrawMode, String disburseId) {
        String alias = requireText(accountAlias, "accountAlias requis");
        String mode = requireText(withdrawMode, "withdrawMode requis");
        BigDecimal safeAmount = requirePositiveAmount(amount);

        String invoiceToken = createInvoice(alias, safeAmount, mode);
        return submitInvoice(invoiceToken, disburseId);
    }

    private String createInvoice(String accountAlias, BigDecimal amount, String withdrawMode) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("account_alias", accountAlias);
        payload.put("amount", amount.setScale(0, RoundingMode.HALF_UP).intValueExact());
        payload.put("withdraw_mode", withdrawMode);
        payload.put("callback_url", defaultCallbackUrl());

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl("/api/v2/disburse/get-invoice"),
                HttpMethod.POST,
                jsonEntity(payload),
                Map.class
        );
        Map<?, ?> body = response.getBody();
        String responseCode = asString(body == null ? null : body.get("response_code"));
        if (!Objects.equals("00", responseCode)) {
            throw new IllegalStateException(asString(body == null ? null : body.get("response_text")));
        }
        String token = asString(body == null ? null : body.get("disburse_token"));
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Token de déboursement PayDunya manquant");
        }
        return token.trim();
    }

    private PaydunyaDisbursementResult submitInvoice(String invoiceToken, String disburseId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("disburse_invoice", invoiceToken);
        if (disburseId != null && !disburseId.isBlank()) {
            payload.put("disburse_id", disburseId.trim());
        }

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl("/api/v2/disburse/submit-invoice"),
                HttpMethod.POST,
                jsonEntity(payload),
                Map.class
        );
        Map<?, ?> body = response.getBody();
        String responseCode = asString(body == null ? null : body.get("response_code"));
        String status = asString(body == null ? null : body.get("status"));
        String responseText = asString(body == null ? null : body.get("response_text"));
        if (status == null || status.isBlank()) {
            throw new IllegalStateException(responseText == null || responseText.isBlank() ? "Réponse PayDunya invalide" : responseText);
        }
        return new PaydunyaDisbursementResult(
                invoiceToken,
                asString(body == null ? null : body.get("disburse_id")),
                status.trim(),
                responseCode,
                responseText,
                asString(body == null ? null : body.get("transaction_id")),
                asString(body == null ? null : body.get("provider_ref"))
        );
    }

    private HttpEntity<Map<String, Object>> jsonEntity(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("PAYDUNYA-MASTER-KEY", requireText(properties.getMasterKey(), "PAYDUNYA master key manquante"));
        headers.set("PAYDUNYA-PRIVATE-KEY", requireText(properties.getPrivateKey(), "PAYDUNYA private key manquante"));
        headers.set("PAYDUNYA-TOKEN", requireText(properties.getToken(), "PAYDUNYA token manquant"));
        return new HttpEntity<>(body, headers);
    }

    private String apiUrl(String path) {
        String configured = properties.getApiBaseUrl();
        String baseUrl = configured == null || configured.isBlank() ? DEFAULT_BASE_URL : configured.trim();
        return baseUrl + path;
    }

    private String defaultCallbackUrl() {
        String configured = properties.getDisbursementCallbackUrl();
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }
        return requireText(properties.getCallbackUrl(), "PAYDUNYA callbackUrl manquante");
    }

    private BigDecimal requirePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Montant invalide pour le déboursement");
        }
        return amount;
    }

    private String requireText(String value, String message) {
        String trimmed = value == null ? null : value.trim();
        if (trimmed == null || trimmed.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
