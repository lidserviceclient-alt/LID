package com.lifeevent.lid.payment.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentStatusResponseDto;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.PaymentTransaction;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.mapper.PaymentMapper;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.PaymentTransactionRepository;
import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.payment.service.PaydunyaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de paiement PayDunya
 * Gère la création, vérification et suivi des paiements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaydunyaSecurityService securityService;
    private final PaydunyaProperties properties;
    private final PaymentMapper paymentMapper;
    private final RestTemplate paydunyaRestTemplate;
    private final OrderRepository orderRepository;
    
    @Override
    public PaymentResponseDto createPayment(CreatePaymentRequestDto request) {
        log.info("Création d'un paiement pour la commande: {}", request.getOrderId());
        ensureConfigured();

        Map<String, Object> invoice = new LinkedHashMap<>();
        invoice.put("total_amount", normalizeAmount(request.getAmount()));
        invoice.put("description", request.getDescription());

        Map<String, Object> customer = new LinkedHashMap<>();
        customer.put("name", request.getCustomerName());
        customer.put("email", request.getCustomerEmail());
        customer.put("phone", request.getCustomerPhone());
        invoice.put("customer", customer);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            Map<String, Object> items = new LinkedHashMap<>();
            for (int i = 0; i < request.getItems().size(); i++) {
                var item = request.getItems().get(i);
                Map<String, Object> node = new LinkedHashMap<>();
                node.put("name", item.getName());
                node.put("quantity", item.getQuantity());
                node.put("unit_price", normalizeAmount(item.getUnitPrice()));
                node.put("total_price", normalizeAmount(item.getTotalPrice()));
                node.put("description", item.getDescription() == null ? "" : item.getDescription());
                items.put("item_" + i, node);
            }
            invoice.put("items", items);
        }

        if (request.getTaxes() != null && !request.getTaxes().isEmpty()) {
            Map<String, Object> taxes = new LinkedHashMap<>();
            for (int i = 0; i < request.getTaxes().size(); i++) {
                var tax = request.getTaxes().get(i);
                Map<String, Object> node = new LinkedHashMap<>();
                node.put("name", tax.getName());
                node.put("amount", normalizeAmount(tax.getAmount()));
                taxes.put("tax_" + i, node);
            }
            invoice.put("taxes", taxes);
        }

        Map<String, Object> customData = new LinkedHashMap<>();
        customData.put("orderId", request.getOrderId());
        customData.put("customerEmail", request.getCustomerEmail());
        customData.put("operator", request.getOperator() == null ? "" : request.getOperator().getDisplayName());
        invoice.put("custom_data", customData);

        Map<String, Object> actions = new LinkedHashMap<>();
        actions.put("callback_url", properties.getCallbackUrl());
        actions.put("return_url", request.getReturnUrl());
        actions.put("cancel_url", request.getCancelUrl());
        invoice.put("actions", actions);

        Map<String, Object> store = new LinkedHashMap<>();
        store.put("name", properties.getStoreName());
        if (properties.getStoreTagline() != null) store.put("tagline", properties.getStoreTagline());
        if (properties.getStorePhoneNumber() != null) store.put("phone", properties.getStorePhoneNumber());
        if (properties.getStorePostalAddress() != null) store.put("postal_address", properties.getStorePostalAddress());
        if (properties.getStoreWebsiteUrl() != null) store.put("website_url", properties.getStoreWebsiteUrl());
        if (properties.getStoreLogoUrl() != null) store.put("logo_url", properties.getStoreLogoUrl());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("invoice", invoice);
        body.put("store", store);

        HttpHeaders headers = buildHeaders();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = paydunyaRestTemplate.postForEntity(paydunyaCreateUrl(), entity, Map.class);
        Map<String, Object> payload = response.getBody() == null ? Map.of() : response.getBody();

        String responseCode = stringValue(payload.get("response_code"));
        if (!"00".equals(responseCode)) {
            String responseText = stringValue(payload.get("response_text"));
            saveFailureTransaction(request.getOrderId(), responseCode, responseText);
            throw new RuntimeException("PayDunya: " + (responseText.isBlank() ? "Erreur de création de paiement" : responseText));
        }

        String invoiceToken = stringValue(payload.get("token"));
        String paymentUrl = stringValue(payload.get("response_text"));

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .invoiceToken(invoiceToken)
                .amount(request.getAmount())
                .currency("XOF")
                .description(request.getDescription())
                .operator(request.getOperator())
                .status(PaymentStatus.PENDING)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .returnUrl(request.getReturnUrl())
                .cancelUrl(request.getCancelUrl())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        saveTransaction(savedPayment, "CREATION", PaymentStatus.PENDING.getCode(),
                "Paiement créé, token: " + invoiceToken, "API");

        PaymentResponseDto dto = paymentMapper.toDto(savedPayment);
        dto.setPaymentUrl(paymentUrl);
        return dto;
    }
    
    @Override
    public PaymentStatusResponseDto verifyPaymentStatus(String invoiceToken) {
        log.info("Vérification du statut du paiement: {}", invoiceToken);
        ensureConfigured();

        Payment payment = paymentRepository.findByInvoiceToken(invoiceToken)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));

        HttpHeaders headers = buildHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = paydunyaRestTemplate.exchange(
                paydunyaConfirmUrl(invoiceToken),
                HttpMethod.GET,
                entity,
                Map.class
        );
        Map<String, Object> payload = response.getBody() == null ? Map.of() : response.getBody();
        Map<String, Object> normalized = unwrapData(payload);

        String responseCode = stringValue(normalized.get("response_code"));
        String responseText = stringValue(normalized.get("response_text"));
        String statusCode = stringValue(firstNonNull(
                normalized.get("status"),
                nested(normalized, "invoice", "status"),
                nested(normalized, "data", "invoice", "status")
        ));
        PaymentStatus status = PaymentStatus.fromCode(statusCode);

        payment.setStatus(status);
        payment.setPaydunyaHash(stringValue(normalized.get("hash")));

        String receiptUrl = stringValue(firstNonNull(
                normalized.get("receipt_url"),
                nested(normalized, "invoice", "receipt_url"),
                nested(normalized, "invoice", "receiptURL"),
                nested(normalized, "receiptURL")
        ));
        if (!receiptUrl.isBlank()) {
            payment.setReceiptUrl(receiptUrl);
        }

        String failReason = stringValue(firstNonNull(
                normalized.get("fail_reason"),
                nested(normalized, "invoice", "fail_reason")
        ));
        if (!failReason.isBlank()) {
            payment.setFailureReason(failReason);
        }

        if (status == PaymentStatus.COMPLETED && payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        paymentRepository.save(payment);
        saveTransaction(payment, "CONFIRMATION", status.getCode(),
                "Statut confirmé: " + responseCode + " - " + responseText, "API");
        syncOrderStatus(payment);

        return PaymentStatusResponseDto.builder()
                .paymentId(payment.getId())
                .invoiceToken(payment.getInvoiceToken())
                .status(payment.getStatus())
                .statusLabel(payment.getStatus().getLabel())
                .responseCode(responseCode)
                .responseText(responseText)
                .receiptUrl(payment.getReceiptUrl())
                .customerName(payment.getCustomerName())
                .customerEmail(payment.getCustomerEmail())
                .customerPhone(payment.getCustomerPhone())
                .build();
    }
    
    @Override
    public PaymentResponseDto getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId.toString()));
        return paymentMapper.toDto(payment);
    }
    
    @Override
    public List<PaymentResponseDto> getPaymentsByOrderId(Long orderId) {
        return paymentMapper.toDtoList(paymentRepository.findByOrderId(orderId));
    }
    
    @Override
    public List<PaymentResponseDto> getPaymentsByCustomerEmail(String customerEmail) {
        return paymentMapper.toDtoList(paymentRepository.findByCustomerEmail(customerEmail));
    }
    
    @Override
    public void processPaymentCallback(String invoiceToken) {
        log.info("Traitement du callback PayDunya pour le token: {}", invoiceToken);
        try {
            verifyPaymentStatus(invoiceToken);
            Payment payment = paymentRepository.findByInvoiceToken(invoiceToken)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));
            saveTransaction(payment, "WEBHOOK_RECEIVED", payment.getStatus().getCode(),
                    "Callback reçu et traité", "WEBHOOK");
        } catch (Exception e) {
            Payment payment = paymentRepository.findByInvoiceToken(invoiceToken).orElse(null);
            if (payment != null) {
                saveTransaction(payment, "WEBHOOK_ERROR", payment.getStatus().getCode(),
                        "Erreur: " + e.getMessage(), "WEBHOOK");
            }
            throw e;
        }
    }
    
    @Override
    public void cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId.toString()));
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Seuls les paiements en attente peuvent être annulés");
        }
        
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);
        saveTransaction(payment, "CANCELLATION", PaymentStatus.CANCELLED.getCode(),
            "Paiement annulé par l'utilisateur", "API");
        
        log.info("Paiement annulé: {}", paymentId);
    }
    
    @Override
    public List<String> getAvailableOperators(String countryCode) {
        return Arrays.stream(com.lifeevent.lid.payment.enums.PaymentOperator.values())
            .filter(op -> op.getCountryCode().equals(countryCode) || "GENERAL".equals(op.getCountryCode()))
            .map(com.lifeevent.lid.payment.enums.PaymentOperator::getOperatorCode)
            .distinct()
            .collect(Collectors.toList());
    }
    
    private void saveTransaction(Payment payment, String type, String statusAtTime, 
                                String details, String source) {
        PaymentTransaction transaction = PaymentTransaction.builder()
            .payment(payment)
            .transactionType(type)
            .statusAtTime(statusAtTime)
            .details(details)
            .source(source)
            .build();
        transactionRepository.save(transaction);
    }

    private void ensureConfigured() {
        if (properties.getMasterKey() == null || properties.getMasterKey().isBlank() || properties.getMasterKey().startsWith("dummy-")) {
            throw new RuntimeException("PayDunya non configuré (PAYDUNYA_MASTER_KEY).");
        }
        if (properties.getPrivateKey() == null || properties.getPrivateKey().isBlank() || properties.getPrivateKey().startsWith("dummy-")) {
            throw new RuntimeException("PayDunya non configuré (PAYDUNYA_PRIVATE_KEY).");
        }
        if (properties.getToken() == null || properties.getToken().isBlank() || properties.getToken().startsWith("dummy-")) {
            throw new RuntimeException("PayDunya non configuré (PAYDUNYA_TOKEN).");
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("PAYDUNYA-MASTER-KEY", properties.getMasterKey());
        headers.set("PAYDUNYA-PRIVATE-KEY", properties.getPrivateKey());
        headers.set("PAYDUNYA-TOKEN", properties.getToken());
        if (properties.getPublicKey() != null && !properties.getPublicKey().isBlank() && !properties.getPublicKey().startsWith("dummy-")) {
            headers.set("PAYDUNYA-PUBLIC-KEY", properties.getPublicKey());
        }
        return headers;
    }

    private String paydunyaCreateUrl() {
        String mode = properties.getMode() == null ? "test" : properties.getMode().trim().toLowerCase();
        if ("live".equals(mode)) return "https://app.paydunya.com/api/v1/checkout-invoice/create";
        return "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";
    }

    private String paydunyaConfirmUrl(String invoiceToken) {
        String mode = properties.getMode() == null ? "test" : properties.getMode().trim().toLowerCase();
        if ("live".equals(mode)) return "https://app.paydunya.com/api/v1/checkout-invoice/confirm/" + invoiceToken;
        return "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/" + invoiceToken;
    }

    private static int normalizeAmount(BigDecimal value) {
        if (value == null) return 0;
        return value.setScale(0, java.math.RoundingMode.HALF_UP).intValue();
    }

    private static int normalizeAmount(Double value) {
        if (value == null) return 0;
        return BigDecimal.valueOf(value).setScale(0, java.math.RoundingMode.HALF_UP).intValue();
    }

    private static String stringValue(Object value) {
        if (value == null) return "";
        String s = String.valueOf(value);
        return s == null ? "" : s;
    }

    private static Object firstNonNull(Object... values) {
        for (Object v : values) {
            if (v != null) return v;
        }
        return null;
    }

    private static Map<String, Object> unwrapData(Map<String, Object> payload) {
        Object data = payload.get("data");
        if (data instanceof Map<?, ?> m) {
            Map<String, Object> out = new LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                out.put(String.valueOf(e.getKey()), e.getValue());
            }
            return out;
        }
        return payload;
    }

    private static Object nested(Map<String, Object> payload, String... path) {
        Object current = payload;
        for (String p : path) {
            if (!(current instanceof Map<?, ?> m)) return null;
            current = m.get(p);
        }
        return current;
    }

    private void syncOrderStatus(Payment payment) {
        if (payment == null || payment.getOrderId() == null) return;
        Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
        if (order == null) return;

        if (payment.getStatus() == PaymentStatus.COMPLETED && order.getCurrentStatus() == Status.PENDING) {
            appendOrderStatus(order, Status.PAID, "Paiement PayDunya confirmé");
        }
        if ((payment.getStatus() == PaymentStatus.CANCELLED || payment.getStatus() == PaymentStatus.FAILED) && order.getCurrentStatus() == Status.PENDING) {
            appendOrderStatus(order, Status.CANCELED, "Paiement PayDunya annulé/échoué");
        }
    }

    private void appendOrderStatus(Order order, Status status, String comment) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new java.util.ArrayList<>());
        }
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
        order.setCurrentStatus(status);
        orderRepository.save(order);
    }

    private void saveFailureTransaction(Long orderId, String responseCode, String responseText) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(BigDecimal.ZERO)
                .currency("XOF")
                .description("Paiement")
                .status(PaymentStatus.FAILED)
                .failureReason(responseText)
                .build();
        Payment saved = paymentRepository.save(payment);
        saveTransaction(saved, "CREATION_FAILED", PaymentStatus.FAILED.getCode(),
                responseCode + " - " + responseText, "API");
    }
}
