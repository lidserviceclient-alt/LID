package com.lifeevent.lid.payment.disbursement.service.impl;

import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementInvoiceRequest;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementInvoiceResponse;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementResult;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementSubmitRequest;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementSubmitResponse;
import com.lifeevent.lid.payment.disbursement.service.PaydunyaDisbursementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaydunyaDisbursementServiceImpl implements PaydunyaDisbursementService {

    private static final String DEFAULT_BASE_URL = "https://app.paydunya.com";
    private static final String GET_INVOICE_PATH = "/api/v2/disburse/get-invoice";
    private static final String SUBMIT_INVOICE_PATH = "/api/v2/disburse/submit-invoice";
    private static final String SUCCESS_RESPONSE_CODE = "00";

    private final PaydunyaProperties properties;
    private final RestTemplate restTemplate;

    @Override
    public PaydunyaDisbursementResult disburse(String accountAlias, BigDecimal amount, String withdrawMode, String disburseId) {
        String alias = requireText(accountAlias, "accountAlias requis");
        String normalizedWithdrawMode = requireText(withdrawMode, "withdrawMode requis").toLowerCase(Locale.ROOT);
        long safeAmount = requirePositiveWholeAmount(amount);

        String invoiceToken = createInvoice(alias, safeAmount, normalizedWithdrawMode);
        return submitInvoice(invoiceToken, disburseId);
    }

    private String createInvoice(String accountAlias, long amount, String withdrawMode) {
        PaydunyaDisbursementInvoiceRequest payload = new PaydunyaDisbursementInvoiceRequest(
                accountAlias,
                amount,
                withdrawMode,
                defaultCallbackUrl()
        );

        log.info("PayDunya disbursement get-invoice request: accountAlias={}, amount={}, withdrawMode={}, callbackUrl={}",
                maskAlias(accountAlias), amount, withdrawMode, payload.callbackUrl());

        PaydunyaDisbursementInvoiceResponse body = exchangeWithRetry(
                GET_INVOICE_PATH,
                payload,
                PaydunyaDisbursementInvoiceResponse.class
        );
        log.info("PayDunya disbursement get-invoice response: responseCode={}, responseText={}, tokenPresent={}",
                body.responseCode(), body.responseText(), hasText(body.disburseToken()));

        if (!SUCCESS_RESPONSE_CODE.equals(body.responseCode())) {
            throw new IllegalStateException(safeResponseText(body.responseText(), "Création du déboursement refusée par PayDunya"));
        }
        if (!hasText(body.disburseToken())) {
            throw new IllegalStateException("Token de déboursement PayDunya manquant");
        }
        return body.disburseToken().trim();
    }

    private PaydunyaDisbursementResult submitInvoice(String invoiceToken, String disburseId) {
        String normalizedInvoiceToken = requireText(invoiceToken, "disburse_invoice requis");
        String normalizedDisburseId = trimToNull(disburseId);
        PaydunyaDisbursementSubmitRequest payload = new PaydunyaDisbursementSubmitRequest(normalizedInvoiceToken, normalizedDisburseId);

        log.info("PayDunya disbursement submit-invoice request: disburseInvoice={}, disburseId={}",
                maskToken(normalizedInvoiceToken), normalizedDisburseId);

        PaydunyaDisbursementSubmitResponse body = exchangeWithRetry(
                SUBMIT_INVOICE_PATH,
                payload,
                PaydunyaDisbursementSubmitResponse.class
        );
        log.info("PayDunya disbursement submit-invoice response: responseCode={}, status={}, responseText={}, transactionId={}",
                body.responseCode(), body.status(), body.responseText(), body.transactionId());

        if (!SUCCESS_RESPONSE_CODE.equals(body.responseCode())) {
            throw new IllegalStateException(safeResponseText(body.responseText(), "Soumission du déboursement refusée par PayDunya"));
        }
        if (!hasText(body.status())) {
            throw new IllegalStateException(safeResponseText(body.responseText(), "Réponse PayDunya invalide"));
        }
        return new PaydunyaDisbursementResult(
                normalizedInvoiceToken,
                body.disburseId(),
                body.status().trim(),
                body.responseCode(),
                body.responseText(),
                body.transactionId(),
                body.providerRef()
        );
    }

    private <T> T exchangeWithRetry(String path, Object payload, Class<T> responseType) {
        int maxAttempts = Math.max(1, properties.getDisbursementRetryMaxAttempts());
        long delayMs = Math.max(100L, properties.getDisbursementRetryInitialDelayMs());

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<T> response = restTemplate.exchange(
                        apiUrl(path),
                        HttpMethod.POST,
                        jsonEntity(payload),
                        responseType
                );
                T body = response.getBody();
                if (body == null) {
                    throw new IllegalStateException("Réponse PayDunya vide");
                }
                return body;
            } catch (RestClientResponseException ex) {
                log.warn("PayDunya HTTP error on {} attempt {}/{}: status={}, body={}",
                        path, attempt, maxAttempts, ex.getRawStatusCode(), ex.getResponseBodyAsString());
                throw new IllegalStateException("Erreur HTTP PayDunya: " + ex.getStatusCode() + " - " + safeResponseText(ex.getResponseBodyAsString(), ex.getMessage()), ex);
            } catch (ResourceAccessException ex) {
                log.warn("PayDunya network error on {} attempt {}/{}: {}", path, attempt, maxAttempts, ex.getMessage());
                if (attempt >= maxAttempts) {
                    throw new IllegalStateException("Erreur réseau PayDunya: " + safeResponseText(ex.getMessage(), "connexion impossible"), ex);
                }
                sleep(delayMs);
                delayMs *= 2;
            }
        }
        throw new IllegalStateException("Tentatives PayDunya épuisées");
    }

    private HttpEntity<Object> jsonEntity(Object body) {
        PaydunyaDisbursementCredentials credentials = resolveCredentials();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("PAYDUNYA-MASTER-KEY", credentials.masterKey());
        headers.set("PAYDUNYA-PRIVATE-KEY", credentials.privateKey());
        headers.set("PAYDUNYA-TOKEN", credentials.token());
        return new HttpEntity<>(body, headers);
    }

    private String apiUrl(String path) {
        String baseUrl = resolveCredentials().baseUrl();
        return baseUrl + path;
    }

    private String defaultCallbackUrl() {
        String configured = properties.getDisbursementCallbackUrl();
        if (hasText(configured)) {
            return configured.trim();
        }
        return requireText(properties.getCallbackUrl(), "PAYDUNYA callbackUrl manquante");
    }

    private long requirePositiveWholeAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Montant invalide pour le déboursement");
        }
        try {
            return amount.longValueExact();
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException("Le montant de déboursement doit être un entier XOF sans décimales", ex);
        }
    }

    private String requireText(String value, String message) {
        String trimmed = value == null ? null : value.trim();
        if (trimmed == null || trimmed.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private PaydunyaDisbursementCredentials resolveCredentials() {
        String masterKey = trimToNull(properties.getMasterKey());
        String privateKey = trimToNull(properties.getPrivateKey());
        String token = trimToNull(properties.getToken());

        String baseUrl = trimToNull(properties.getApiBaseUrl());
        if (baseUrl == null) {
            baseUrl = DEFAULT_BASE_URL;
        }

        return new PaydunyaDisbursementCredentials(
                requireText(masterKey, "PAYDUNYA master key manquante"),
                requireText(privateKey, "PAYDUNYA private key manquante"),
                requireText(token, "PAYDUNYA token manquant"),
                requireText(baseUrl, "PAYDUNYA api base url manquante")
        );
    }

    private String trimToNull(String value) {
        String normalized = value == null ? null : value.trim();
        return normalized == null || normalized.isBlank() ? null : normalized;
    }

    private boolean hasText(String value) {
        return trimToNull(value) != null;
    }

    private String safeResponseText(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized != null ? normalized : fallback;
    }

    private void sleep(long delayMs) {
        try {
            TimeUnit.MILLISECONDS.sleep(delayMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Retry PayDunya interrompu", ex);
        }
    }

    private String maskAlias(String alias) {
        String normalized = trimToNull(alias);
        if (normalized == null || normalized.length() <= 4) {
            return "***";
        }
        return normalized.substring(0, 2) + "***" + normalized.substring(normalized.length() - 2);
    }

    private String maskToken(String token) {
        String normalized = trimToNull(token);
        if (normalized == null || normalized.length() <= 6) {
            return "***";
        }
        return normalized.substring(0, 3) + "***" + normalized.substring(normalized.length() - 3);
    }

    private record PaydunyaDisbursementCredentials(
            String masterKey,
            String privateKey,
            String token,
            String baseUrl
    ) {}
}
