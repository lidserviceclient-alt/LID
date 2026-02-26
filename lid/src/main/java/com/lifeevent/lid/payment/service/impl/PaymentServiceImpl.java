package com.lifeevent.lid.payment.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CommandeLigne;
import com.lifeevent.lid.core.entity.Livraison;
import com.lifeevent.lid.core.entity.Paiement;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.enums.StatutPaiement;
import com.lifeevent.lid.core.repository.CommandeLigneRepository;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.LivraisonRepository;
import com.lifeevent.lid.core.repository.PaiementRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

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

    // Core entities used by backoffice + delivery apps
    private final UtilisateurRepository utilisateurRepository;
    private final CommandeRepository commandeRepository;
    private final CommandeLigneRepository commandeLigneRepository;
    private final LivraisonRepository livraisonRepository;
    private final PaiementRepository corePaiementRepository;
    private final ProduitRepository produitRepository;
    
    @Override
    public PaymentResponseDto createPayment(CreatePaymentRequestDto request) {
        log.info("Création d'un paiement pour la commande: {}", request.getOrderId());
        ensureConfigured();

        Map<String, Object> invoice = new LinkedHashMap<>();
        int invoiceTotalAmount = normalizeAmount(request.getAmount());
        invoice.put("total_amount", invoiceTotalAmount);
        invoice.put("description", request.getDescription());

        Map<String, Object> customer = new LinkedHashMap<>();
        customer.put("name", trimToNull(request.getCustomerName()));
        customer.put("email", trimToNull(request.getCustomerEmail()));
        String customerPhone = firstNonBlank(
                normalizePhoneForPaydunya(request.getCustomerPhone()),
                trimToNull(request.getCustomerPhone())
        );
        customer.put("phone", customerPhone);
        invoice.put("customer", customer);

        Map<String, Object> invoiceItems = null;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            Map<String, Object> items = new LinkedHashMap<>();
            int sumItems = 0;
            int written = 0;

            for (int i = 0; i < request.getItems().size(); i++) {
                var item = request.getItems().get(i);
                if (item == null) continue;
                int qty = item.getQuantity() == null ? 0 : item.getQuantity();
                if (qty <= 0) continue;

                int unit = normalizeAmount(item.getUnitPrice());
                int lineTotal = unit * qty;
                if (lineTotal <= 0) continue;

                Map<String, Object> node = new LinkedHashMap<>();
                node.put("name", item.getName());
                node.put("quantity", qty);
                node.put("unit_price", unit);
                node.put("total_price", lineTotal);
                node.put("description", item.getDescription() == null ? "" : item.getDescription());
                items.put("item_" + written, node);
                written++;
                sumItems += lineTotal;
            }

            if (sumItems > 0) {
                int delta = invoiceTotalAmount - sumItems;
                if (delta > 0) {
                    Map<String, Object> fees = new LinkedHashMap<>();
                    fees.put("name", "Frais / Livraison");
                    fees.put("quantity", 1);
                    fees.put("unit_price", delta);
                    fees.put("total_price", delta);
                    fees.put("description", "");
                    items.put("item_" + written, fees);
                    sumItems += delta;
                }

                if (sumItems == invoiceTotalAmount) {
                    invoiceItems = items;
                } else {
                    log.warn("Items PayDunya incohérents (total items={} != total invoice={}) pour orderId={}, fallback item unique.",
                            sumItems, invoiceTotalAmount, request.getOrderId());
                }
            }
        }
        if (invoiceItems == null) {
            invoiceItems = singleItem(invoiceTotalAmount, request.getDescription());
        }
        invoice.put("items", invoiceItems);

        Map<String, Object> customData = new LinkedHashMap<>();
        customData.put("orderId", request.getOrderId());
        customData.put("customerEmail", request.getCustomerEmail());
        customData.put("operator", request.getOperator() == null ? "" : request.getOperator().getDisplayName());
        invoice.put("custom_data", customData);

        Map<String, Object> actions = new LinkedHashMap<>();
        actions.put("callback_url", properties.getCallbackUrl());
        String returnUrl = trimToNull(request.getReturnUrl());
        String cancelUrl = trimToNull(request.getCancelUrl());
        if (isLiveMode()) {
            if (returnUrl == null || !returnUrl.startsWith("https://") || looksLikeLocalhostUrl(returnUrl)) {
                returnUrl = trimToNull(properties.getReturnUrl());
            }
            if (cancelUrl == null || !cancelUrl.startsWith("https://") || looksLikeLocalhostUrl(cancelUrl)) {
                cancelUrl = trimToNull(properties.getCancelUrl());
            }
        }
        actions.put("return_url", firstNonBlank(returnUrl, properties.getReturnUrl()));
        actions.put("cancel_url", firstNonBlank(cancelUrl, properties.getCancelUrl()));
        invoice.put("actions", actions);

        Map<String, Object> store = new LinkedHashMap<>();
        store.put("name", firstNonBlank(properties.getStoreName(), "LID"));
        putIfNotBlank(store, "tagline", properties.getStoreTagline());

        String storePhone = trimToNull(properties.getStorePhoneNumber());
        if (storePhone == null || !looksLikePhone(storePhone) || looksLikePlaceholder(storePhone)) {
            log.warn("PayDunya store phone invalide ou manquant, fallback utilisé.");
            storePhone = "+2250102030405";
        }
        store.put("phone", storePhone);

        putIfNotBlank(store, "postal_address", properties.getStorePostalAddress());
        String website = trimToNull(properties.getStoreWebsiteUrl());
        if (website != null && looksLikeHttpUrl(website) && !looksLikePlaceholder(website)) {
            store.put("website_url", website);
        }
        String logoUrl = trimToNull(properties.getStoreLogoUrl());
        if (logoUrl != null && looksLikeHttpUrl(logoUrl) && !looksLikePlaceholder(logoUrl)) {
            store.put("logo_url", logoUrl);
        }

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
            log.error(
                    "PayDunya create invoice failed (mode={}, orderId={}, code={}, text={}, callbackUrl={}, returnUrl={}, cancelUrl={})",
                    properties.getMode(),
                    request.getOrderId(),
                    responseCode,
                    responseText,
                    properties.getCallbackUrl(),
                    firstNonBlank(returnUrl, properties.getReturnUrl()),
                    firstNonBlank(cancelUrl, properties.getCancelUrl())
            );
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
                .customerPhone(customerPhone)
                .returnUrl(firstNonBlank(returnUrl, properties.getReturnUrl()))
                .cancelUrl(firstNonBlank(cancelUrl, properties.getCancelUrl()))
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        saveTransaction(savedPayment, "CREATION", PaymentStatus.PENDING.getCode(),
                "Paiement créé, token: " + invoiceToken, "API");

        PaymentResponseDto dto = paymentMapper.toDto(savedPayment);
        dto.setPaymentUrl(paymentUrl);
        return dto;
    }

    @Override
    public PaymentResponseDto createLocalPayment(CreatePaymentRequestDto request) {
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("orderId requis");
        }

        Long orderId = request.getOrderId();
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            throw new ResourceNotFoundException("Order", "id", String.valueOf(orderId));
        }

        Payment existing = paymentRepository.findByOrderId(orderId).stream()
                .filter(p -> p != null && p.getStatus() == PaymentStatus.COMPLETED)
                .findFirst()
                .orElse(null);
        if (existing != null) {
            return paymentMapper.toDto(existing);
        }

        String invoiceToken = "LOCAL-" + java.util.UUID.randomUUID();
        String customerPhone = firstNonBlank(
                normalizePhoneForPaydunya(request.getCustomerPhone()),
                trimToNull(request.getCustomerPhone())
        );

        Payment payment = Payment.builder()
                .orderId(orderId)
                .invoiceToken(invoiceToken)
                .amount(request.getAmount())
                .currency("XOF")
                .description(firstNonBlank(request.getDescription(), "Paiement local"))
                .operator(request.getOperator())
                .status(PaymentStatus.COMPLETED)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(customerPhone)
                .returnUrl(trimToNull(request.getReturnUrl()))
                .cancelUrl(trimToNull(request.getCancelUrl()))
                .paymentDate(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        saveTransaction(saved, "LOCAL_CONFIRM", PaymentStatus.COMPLETED.getCode(), "Paiement local confirmé", "LOCAL");
        syncOrderStatus(saved);
        return paymentMapper.toDto(saved);
    }
    
    @Override
    public PaymentStatusResponseDto verifyPaymentStatus(String invoiceToken) {
        log.info("Vérification du statut du paiement: {}", invoiceToken);
        Payment payment = paymentRepository.findByInvoiceToken(invoiceToken)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));

        if (isLocalInvoiceToken(payment.getInvoiceToken())) {
            if (payment.getStatus() == PaymentStatus.COMPLETED && payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);
            }
            saveTransaction(payment, "LOCAL_VERIFY", payment.getStatus().getCode(), "Statut local: " + payment.getStatus().getCode(), "LOCAL");
            PostPaymentSyncResult postSync = syncOrderStatus(payment);
            return PaymentStatusResponseDto.builder()
                    .paymentId(payment.getId())
                    .invoiceToken(payment.getInvoiceToken())
                    .status(payment.getStatus())
                    .statusLabel(payment.getStatus().getLabel())
                    .responseCode("LOCAL")
                    .responseText("Paiement local")
                    .receiptUrl(payment.getReceiptUrl())
                    .customerName(payment.getCustomerName())
                    .customerEmail(payment.getCustomerEmail())
                    .customerPhone(payment.getCustomerPhone())
                    .postPaymentSyncOk(postSync.ok)
                    .postPaymentSyncError(postSync.error)
                    .coreOrderId(postSync.coreOrderId)
                    .coreShipmentId(postSync.coreShipmentId)
                    .build();
        }

        ensureConfigured();

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
        PostPaymentSyncResult postSync = syncOrderStatus(payment);

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
                .postPaymentSyncOk(postSync.ok)
                .postPaymentSyncError(postSync.error)
                .coreOrderId(postSync.coreOrderId)
                .coreShipmentId(postSync.coreShipmentId)
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
        if (isLiveMode()) return "https://app.paydunya.com/api/v1/checkout-invoice/create";
        return "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";
    }

    private String paydunyaConfirmUrl(String invoiceToken) {
        if (isLiveMode()) return "https://app.paydunya.com/api/v1/checkout-invoice/confirm/" + invoiceToken;
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

    private PostPaymentSyncResult syncOrderStatus(Payment payment) {
        if (payment == null || payment.getOrderId() == null) return PostPaymentSyncResult.notApplicable();
        Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
        if (order == null) {
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                String msg = "Commande introuvable pour orderId=" + payment.getOrderId();
                log.error("syncOrderStatus: {}", msg);
                saveTransaction(payment, "CORE_SYNC_ERROR", payment.getStatus().getCode(), msg, "API");
                return PostPaymentSyncResult.error(msg, null, null);
            }
            return PostPaymentSyncResult.notApplicable();
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            if (order.getCurrentStatus() == Status.PENDING) {
                appendOrderStatus(order, Status.PAID, "Paiement PayDunya confirmé");
            }
            if (order.getCurrentStatus() == Status.PAID) {
                appendOrderStatus(order, Status.PROCESSING, "Commande en cours de traitement");
            }
            try {
                CoreSyncIds ids = syncCoreOrderAndShipment(order, payment);
                saveTransaction(payment, "CORE_SYNC_OK", payment.getStatus().getCode(),
                        "coreOrderId=" + ids.coreOrderId + "; coreShipmentId=" + (ids.coreShipmentId == null ? "" : ids.coreShipmentId), "API");
                return PostPaymentSyncResult.ok(ids.coreOrderId, ids.coreShipmentId);
            } catch (Exception e) {
                String coreOrderId = "ORD-" + order.getId();
                String msg = describeThrowable(e);
                log.error("Erreur sync backoffice (orderId={}): {}", order.getId(), msg, e);
                saveTransaction(payment, "CORE_SYNC_ERROR", payment.getStatus().getCode(),
                        "coreOrderId=" + coreOrderId + "; error=" + msg, "API");
                return PostPaymentSyncResult.error(msg, coreOrderId, null);
            }
        }
        if ((payment.getStatus() == PaymentStatus.CANCELLED || payment.getStatus() == PaymentStatus.FAILED)
                && (order.getCurrentStatus() == Status.PENDING || order.getCurrentStatus() == Status.PAID)) {
            appendOrderStatus(order, Status.CANCELED, "Paiement PayDunya annulé/échoué");
        }
        return PostPaymentSyncResult.notApplicable();
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

    private CoreSyncIds syncCoreOrderAndShipment(Order order, Payment payment) {
        if (order == null || payment == null) {
            throw new IllegalArgumentException("order/payment requis");
        }
        if (utilisateurRepository == null || commandeRepository == null || livraisonRepository == null) {
            throw new IllegalStateException("Core repositories non initialisés");
        }

        String paymentEmail = trimToNull(payment.getCustomerEmail());
        String fallbackEmail = order.getCustomer() != null ? trimToNull(order.getCustomer().getEmail()) : null;
        String email = firstNonBlank(paymentEmail, fallbackEmail);
        if (email == null) {
            throw new IllegalStateException("email client manquant pour order " + order.getId());
        }

        String paymentPhone = trimToNull(payment.getCustomerPhone());

        Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new Utilisateur();
            user.setEmail(email);
            user.setEmailVerifie(false);
            user.setRole(RoleUtilisateur.CLIENT);
            if (paymentPhone != null) {
                user.setTelephone(paymentPhone);
            }
            String fullName = trimToNull(payment.getCustomerName());
            if (fullName != null) {
                String[] parts = fullName.split("\\s+");
                if (parts.length == 1) {
                    user.setNom(parts[0]);
                } else if (parts.length >= 2) {
                    user.setPrenom(parts[0]);
                    user.setNom(String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)));
                }
            }
            user = utilisateurRepository.save(user);
        } else {
            boolean changed = false;
            if (user.getRole() == null) {
                user.setRole(RoleUtilisateur.CLIENT);
                changed = true;
            }
            if (paymentPhone != null && (user.getTelephone() == null || user.getTelephone().isBlank())) {
                user.setTelephone(paymentPhone);
                changed = true;
            }
            if (changed) {
                user = utilisateurRepository.save(user);
            }
        }

        String coreOrderId = "ORD-" + order.getId();

        Commande commande = commandeRepository.findById(coreOrderId).orElse(null);
        if (commande == null) {
            commande = new Commande();
            commande.setId(coreOrderId);
            commande.setClient(user);
        } else if (commande.getClient() == null) {
            commande.setClient(user);
        }

        BigDecimal total = payment.getAmount();
        if (total == null && order.getAmount() != null) {
            total = BigDecimal.valueOf(order.getAmount());
        }
        if (total == null) total = BigDecimal.ZERO;
        commande.setMontantTotal(total.setScale(2, RoundingMode.HALF_UP));

        String currency = trimToNull(order.getCurrency());
        if (currency == null) currency = "XOF";
        commande.setDevise(currency);
        if (commande.getStatut() == null || commande.getStatut() == StatutCommande.CREEE || commande.getStatut() == StatutCommande.PAYEE) {
            commande.setStatut(StatutCommande.EXPEDIEE);
        }

        commande = commandeRepository.save(commande);

        if (commandeLigneRepository != null && commandeLigneRepository.countByCommandeId(coreOrderId) == 0) {
            List<OrderArticle> lines = order.getArticles();
            if (lines != null) {
                for (OrderArticle oa : lines) {
                    if (oa == null) continue;
                    Integer qty = oa.getQuantity();
                    if (qty == null || qty <= 0) continue;

                    BigDecimal unit = oa.getPriceAtOrder() == null
                            ? null
                            : BigDecimal.valueOf(oa.getPriceAtOrder()).setScale(2, RoundingMode.HALF_UP);

                    Produit produit = null;
                    try {
                        String ref = oa.getArticle() != null ? trimToNull(oa.getArticle().getReferenceProduitPartenaire()) : null;
                        if (ref != null && produitRepository != null) {
                            produit = produitRepository.findByReferencePartenaireIgnoreCase(ref).orElse(null);
                        }
                    } catch (Exception ignored) {
                        // ignore mapping issues
                    }

                    CommandeLigne l = new CommandeLigne();
                    l.setCommande(commande);
                    l.setProduit(produit);
                    l.setQuantite(qty);
                    l.setPrixUnitaire(unit);
                    commandeLigneRepository.save(l);
                }
            }
        }

        if (corePaiementRepository != null) {
            String txnId = trimToNull(payment.getInvoiceToken());
            List<Paiement> existing = corePaiementRepository.findByCommande(commande);
            boolean alreadyPaid = existing != null && existing.stream().filter(Objects::nonNull).anyMatch((p) ->
                    txnId != null && txnId.equals(trimToNull(p.getTransactionId())) && p.getStatut() == StatutPaiement.SUCCES
            );
            if (!alreadyPaid) {
                Paiement p = new Paiement();
                p.setCommande(commande);
                p.setFournisseur("PAYDUNYA");
                p.setMontant(total != null ? total.setScale(2, RoundingMode.HALF_UP) : null);
                p.setDevise(currency);
                p.setStatut(StatutPaiement.SUCCES);
                p.setTransactionId(txnId);
                p.setDatePaiement(payment.getPaymentDate() != null ? payment.getPaymentDate() : LocalDateTime.now());
                corePaiementRepository.save(p);
            }
        }

        Livraison livraison = livraisonRepository.findByCommande(commande).orElse(null);
        if (livraison == null) {
            livraison = new Livraison();
            livraison.setCommande(commande);
        }
        if (livraison.getStatut() == null) {
            livraison.setStatut(StatutLivraison.EN_PREPARATION);
        }
        if (livraison.getNumeroSuivi() == null || livraison.getNumeroSuivi().isBlank()) {
            String tracking = trimToNull(order.getTrackingNumber());
            if (tracking == null) tracking = "LID-" + coreOrderId;
            livraison.setNumeroSuivi(tracking);
        }

        Livraison savedShipment = livraisonRepository.save(livraison);
        return new CoreSyncIds(coreOrderId, savedShipment != null ? savedShipment.getId() : null);
    }

    private record CoreSyncIds(String coreOrderId, String coreShipmentId) {}

    private static final class PostPaymentSyncResult {
        private final Boolean ok;
        private final String error;
        private final String coreOrderId;
        private final String coreShipmentId;

        private PostPaymentSyncResult(Boolean ok, String error, String coreOrderId, String coreShipmentId) {
            this.ok = ok;
            this.error = error;
            this.coreOrderId = coreOrderId;
            this.coreShipmentId = coreShipmentId;
        }

        static PostPaymentSyncResult notApplicable() {
            return new PostPaymentSyncResult(null, null, null, null);
        }

        static PostPaymentSyncResult ok(String coreOrderId, String coreShipmentId) {
            return new PostPaymentSyncResult(Boolean.TRUE, null, coreOrderId, coreShipmentId);
        }

        static PostPaymentSyncResult error(String error, String coreOrderId, String coreShipmentId) {
            return new PostPaymentSyncResult(Boolean.FALSE, error, coreOrderId, coreShipmentId);
        }
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

    private static String trimToNull(String value) {
        if (value == null) return null;
        String s = value.trim();
        return s.isBlank() ? null : s;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            String s = trimToNull(v);
            if (s != null) return s;
        }
        return null;
    }

    private static void putIfNotBlank(Map<String, Object> target, String key, String value) {
        if (target == null || key == null) return;
        String s = trimToNull(value);
        if (s == null) return;
        target.put(key, s);
    }

    private static boolean isLocalInvoiceToken(String value) {
        String s = trimToNull(value);
        return s != null && s.startsWith("LOCAL-");
    }

    private static String describeThrowable(Throwable t) {
        if (t == null) return "Erreur sync backoffice";
        Throwable cur = t;
        int guard = 0;
        while (cur.getCause() != null && cur.getCause() != cur && guard < 12) {
            cur = cur.getCause();
            guard++;
        }
        String type = cur.getClass().getSimpleName();
        String message = cur.getMessage();
        if (message == null || message.isBlank()) {
            return type;
        }
        return type + ": " + message;
    }

    private static Map<String, Object> singleItem(int totalAmount, String description) {
        Map<String, Object> items = new LinkedHashMap<>();
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("name", firstNonBlank(description, "Commande"));
        node.put("quantity", 1);
        node.put("unit_price", totalAmount);
        node.put("total_price", totalAmount);
        node.put("description", "");
        items.put("item_0", node);
        return items;
    }

    private static String normalizePhoneForPaydunya(String value) {
        String s = trimToNull(value);
        if (s == null) return null;

        boolean hasPlus = s.startsWith("+");
        String digits = s.replaceAll("\\D+", "");
        if (digits.isBlank()) return null;
        return hasPlus ? ("+" + digits) : digits;
    }

    private boolean isLiveMode() {
        String mode = properties.getMode() == null ? "test" : properties.getMode().trim().toLowerCase();
        return "live".equals(mode) || "prod".equals(mode) || "production".equals(mode);
    }

    private static boolean looksLikeLocalhostUrl(String value) {
        String s = trimToNull(value);
        if (s == null) return false;
        try {
            java.net.URI uri = java.net.URI.create(s);
            String host = uri.getHost();
            if (host == null) return false;
            String h = host.toLowerCase(java.util.Locale.ROOT);
            return "localhost".equals(h) || "127.0.0.1".equals(h);
        } catch (Exception ex) {
            return false;
        }
    }

    private static boolean looksLikePhone(String value) {
        String s = trimToNull(value);
        if (s == null) return false;
        return s.matches("^[0-9+\\-\\s()]{7,}$");
    }

    private static boolean looksLikeHttpUrl(String value) {
        String s = trimToNull(value);
        if (s == null) return false;
        return s.startsWith("http://") || s.startsWith("https://");
    }

    private static boolean looksLikePlaceholder(String value) {
        String s = trimToNull(value);
        if (s == null) return false;
        String u = s.toUpperCase();
        return u.contains("XXXX") || u.contains("DUMMY") || u.contains("CHANGEME") || u.contains("REPLACE");
    }
}
