package com.lifeevent.lid.payment.service.impl;

import com.paydunya.neptune.PaydunyaCheckoutInvoice;
import com.paydunya.neptune.PaydunyaSetup;
import com.paydunya.neptune.PaydunyaCheckoutStore;
import com.lifeevent.lid.backoffice.lid.notification.dto.CreateBackOfficeNotificationRequest;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import com.lifeevent.lid.backoffice.lid.notification.service.BackOfficeNotificationService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
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
import com.lifeevent.lid.realtime.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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
    private final PaydunyaSetup paydunyaSetup;
    private final PaydunyaCheckoutStore paydunyaStore;
    private final PaymentMapper paymentMapper;
    private final RealtimeEventPublisher realtimeEventPublisher;
    private final BackOfficeNotificationService backOfficeNotificationService;
    
    @Override
    public PaymentResponseDto createPayment(CreatePaymentRequestDto request) {
        validateCreateRequest(request);

        PaydunyaCheckoutInvoice invoice = buildInvoice(request);
        if (!invoice.create()) {
            String message = safeText(invoice.getResponseText(), "Impossible de créer la facture de paiement");
            throw new IllegalStateException(message);
        }

        Payment savedPayment = paymentRepository.save(toPendingPayment(request, invoice.getToken()));
        saveTransaction(
                savedPayment,
                "CREATION",
                PaymentStatus.PENDING.getCode(),
                "Paiement créé, token: " + savedPayment.getInvoiceToken(),
                "API"
        );
        PaymentResponseDto dto = paymentMapper.toDto(savedPayment);
        dto.setPaymentUrl(safeText(invoice.getInvoiceUrl(), null));
        return dto;
    }

    @Override
    public PaymentResponseDto createLocalPayment(CreatePaymentRequestDto request) {
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("orderId requis");
        }

        Payment existing = paymentRepository.findByOrderId(request.getOrderId()).stream()
                .filter(payment -> payment != null && payment.getStatus() == PaymentStatus.COMPLETED)
                .findFirst()
                .orElse(null);
        if (existing != null) {
            return paymentMapper.toDto(existing);
        }

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .invoiceToken("LOCAL-" + java.util.UUID.randomUUID())
                .amount(request.getAmount())
                .currency("XOF")
                .description(safeText(request.getDescription(), "Paiement local"))
                .operator(request.getOperator())
                .status(PaymentStatus.COMPLETED)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .returnUrl(resolveReturnUrl(request))
                .cancelUrl(resolveCancelUrl(request))
                .paymentDate(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        saveTransaction(
                savedPayment,
                "LOCAL_CONFIRM",
                PaymentStatus.COMPLETED.getCode(),
                "Paiement local confirmé",
                "LOCAL"
        );
        createNotificationForPaymentStatus(savedPayment, null);
        return paymentMapper.toDto(savedPayment);
    }
    
    @Override
    public PaymentStatusResponseDto verifyPaymentStatus(String invoiceToken) {
        Payment payment = findPaymentByToken(invoiceToken);
        if (isLocalInvoiceToken(payment.getInvoiceToken())) {
            if (payment.getStatus() == PaymentStatus.COMPLETED && payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);
            }
            saveTransaction(
                    payment,
                    "LOCAL_VERIFY",
                    payment.getStatus().getCode(),
                    "Statut local: " + payment.getStatus().getCode(),
                    "LOCAL"
            );
            realtimeEventPublisher.publishPaymentStatusUpdated(payment, "verify_local");
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
                    .build();
        }
        PaydunyaCheckoutInvoice invoice = newInvoice();
        if (!invoice.confirm(invoiceToken)) {
            saveTransaction(
                    payment,
                    "CONFIRMATION_FAILED",
                    payment.getStatus().getCode(),
                    "Erreur: " + safeText(invoice.getResponseText(), "Confirmation impossible"),
                    "API"
            );
            return buildStatusResponse(payment, invoice);
        }

        PaymentStatus previousStatus = payment.getStatus();
        applyInvoiceStatus(payment, invoice);
        paymentRepository.save(payment);
        saveTransaction(
                payment,
                "CONFIRMATION",
                payment.getStatus().getCode(),
                "Statut confirmé: " + safeText(invoice.getResponseText(), payment.getStatus().getCode()),
                "API"
        );
        realtimeEventPublisher.publishPaymentStatusUpdated(payment, "verify_api");
        createNotificationForPaymentStatus(payment, previousStatus);
        return buildStatusResponse(payment, invoice);
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
        Payment payment = findPaymentByToken(invoiceToken);
        PaydunyaCheckoutInvoice invoice = newInvoice();
        if (!invoice.confirm(invoiceToken)) {
            saveTransaction(
                    payment,
                    "WEBHOOK_CONFIRMATION_FAILED",
                    payment.getStatus().getCode(),
                    "Erreur: " + safeText(invoice.getResponseText(), "Confirmation impossible"),
                    "WEBHOOK"
            );
            return;
        }

        PaymentStatus previousStatus = payment.getStatus();
        applyInvoiceStatus(payment, invoice);
        paymentRepository.save(payment);
        saveTransaction(
                payment,
                "WEBHOOK_RECEIVED",
                payment.getStatus().getCode(),
                "Callback reçu et traité",
                "WEBHOOK"
        );
        realtimeEventPublisher.publishPaymentStatusUpdated(payment, "webhook");
        createNotificationForPaymentStatus(payment, previousStatus);
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
        if (shouldSkipDuplicateTransaction(payment, type, statusAtTime, source)) {
            return;
        }
        PaymentTransaction transaction = PaymentTransaction.builder()
            .payment(payment)
            .transactionType(type)
            .statusAtTime(statusAtTime)
            .details(details)
            .source(source)
            .build();
        transactionRepository.save(transaction);
    }

    private boolean shouldSkipDuplicateTransaction(Payment payment,
                                                   String type,
                                                   String statusAtTime,
                                                   String source) {
        if (payment == null || payment.getId() == null) {
            return false;
        }
        if (!"CONFIRMATION".equals(type) && !"LOCAL_VERIFY".equals(type)) {
            return false;
        }
        return transactionRepository
                .findTopByPaymentIdAndTransactionTypeAndStatusAtTimeAndSourceOrderByCreatedAtDesc(
                        payment.getId(),
                        type,
                        statusAtTime,
                        source
                )
                .map(existing -> {
                    LocalDateTime createdAt = existing.getCreatedAt();
                    if (createdAt == null) {
                        return false;
                    }
                    return ChronoUnit.SECONDS.between(createdAt, LocalDateTime.now()) < 10;
                })
                .orElse(false);
    }

    private Payment findPaymentByToken(String invoiceToken) {
        return paymentRepository.findByInvoiceToken(invoiceToken)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));
    }

    private void validateCreateRequest(CreatePaymentRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de paiement est requise");
        }
        if (request.getOperator() == null) {
            throw new IllegalArgumentException("L'opérateur de paiement est requis");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant doit être supérieur à 0");
        }
    }

    private PaydunyaCheckoutInvoice buildInvoice(CreatePaymentRequestDto request) {
        PaydunyaCheckoutInvoice invoice = newInvoice();
        addItems(invoice, request);
        addTaxes(invoice, request);
        invoice.setTotalAmount(request.getAmount().doubleValue());
        invoice.setDescription(request.getDescription());
        invoice.setReturnUrl(resolveReturnUrl(request));
        invoice.setCancelUrl(resolveCancelUrl(request));
        invoice.setCallbackUrl(properties.getCallbackUrl());
        invoice.addCustomData("orderId", String.valueOf(request.getOrderId()));
        invoice.addCustomData("customerEmail", request.getCustomerEmail());
        invoice.addCustomData("operator", request.getOperator().getDisplayName());
        return invoice;
    }

    private PaydunyaCheckoutInvoice newInvoice() {
        return new PaydunyaCheckoutInvoice(paydunyaSetup, paydunyaStore);
    }

    private void addItems(PaydunyaCheckoutInvoice invoice, CreatePaymentRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return;
        }
        request.getItems().stream()
                .filter(Objects::nonNull)
                .forEach(item -> invoice.addItem(
                        item.getName(),
                        item.getQuantity(),
                        item.getUnitPrice().doubleValue(),
                        item.getTotalPrice().doubleValue(),
                        item.getDescription()
                ));
    }

    private void addTaxes(PaydunyaCheckoutInvoice invoice, CreatePaymentRequestDto request) {
        if (request.getTaxes() == null || request.getTaxes().isEmpty()) {
            return;
        }
        request.getTaxes().stream()
                .filter(Objects::nonNull)
                .forEach(tax -> invoice.addTax(tax.getName(), tax.getAmount().doubleValue()));
    }

    private Payment toPendingPayment(CreatePaymentRequestDto request, String invoiceToken) {
        return Payment.builder()
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
                .returnUrl(resolveReturnUrl(request))
                .cancelUrl(resolveCancelUrl(request))
                .build();
    }

    private void applyInvoiceStatus(Payment payment, PaydunyaCheckoutInvoice invoice) {
        String rawStatus = invoice.getStatus();
        PaymentStatus status = toPaymentStatus(rawStatus);
        payment.setStatus(status);
        payment.setPaydunyaHash(invoice.getResponseText());

        if (status == PaymentStatus.COMPLETED) {
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
            }
            payment.setReceiptUrl(invoice.getReceiptUrl());
            payment.setCustomerName(safeText(toStringValue(invoice.getCustomerInfo("name")), payment.getCustomerName()));
            payment.setCustomerEmail(safeText(toStringValue(invoice.getCustomerInfo("email")), payment.getCustomerEmail()));
            payment.setCustomerPhone(safeText(toStringValue(invoice.getCustomerInfo("phone")), payment.getCustomerPhone()));
            payment.setFailureReason(null);
            return;
        }

        if (status == PaymentStatus.FAILED || status == PaymentStatus.CANCELLED) {
            payment.setFailureReason(safeText(invoice.getResponseText(), "Paiement échoué"));
        }
    }

    private PaymentStatus toPaymentStatus(String rawStatus) {
        if (rawStatus == null) {
            return PaymentStatus.PENDING;
        }
        String normalized = rawStatus.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "completed", "success", "succeeded", "paid" -> PaymentStatus.COMPLETED;
            case "cancelled", "canceled" -> PaymentStatus.CANCELLED;
            case "failed", "error" -> PaymentStatus.FAILED;
            case "refunded" -> PaymentStatus.REFUNDED;
            default -> PaymentStatus.PENDING;
        };
    }

    private String resolveReturnUrl(CreatePaymentRequestDto request) {
        return safeText(request.getReturnUrl(), properties.getReturnUrl());
    }

    private String resolveCancelUrl(CreatePaymentRequestDto request) {
        return safeText(request.getCancelUrl(), properties.getCancelUrl());
    }

    private String safeText(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private String toStringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private boolean isLocalInvoiceToken(String invoiceToken) {
        return invoiceToken != null && invoiceToken.startsWith("LOCAL-");
    }
    
    private PaymentStatusResponseDto buildStatusResponse(Payment payment, 
                                                         PaydunyaCheckoutInvoice invoice) {
        return PaymentStatusResponseDto.builder()
            .paymentId(payment.getId())
            .invoiceToken(payment.getInvoiceToken())
            .status(payment.getStatus())
            .statusLabel(payment.getStatus().getLabel())
            .responseCode(invoice.getResponseCode())
            .responseText(invoice.getResponseText())
            .receiptUrl(payment.getReceiptUrl())
            .customerName(payment.getCustomerName())
            .customerEmail(payment.getCustomerEmail())
            .customerPhone(payment.getCustomerPhone())
            .build();
    }

    private void createNotificationForPaymentStatus(Payment payment, PaymentStatus previousStatus) {
        if (payment == null || payment.getOrderId() == null || payment.getStatus() == null) {
            return;
        }
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            backOfficeNotificationService.create(CreateBackOfficeNotificationRequest.builder()
                    .type(BackOfficeNotificationType.NEW_ORDER)
                    .scope(BackOfficeNotificationScope.BACKOFFICE)
                    .targetRole(BackOfficeNotificationTargetRole.ADMIN)
                    .title("Nouvelle commande validée")
                    .body("Commande ORD-" + payment.getOrderId() + " payée avec succès")
                    .actionPath("/orders")
                    .actionLabel("Ouvrir")
                    .severity(BackOfficeNotificationSeverity.SUCCESS)
                    .dedupeKey("NEW_ORDER:" + payment.getOrderId())
                    .payload(java.util.Map.of(
                            "orderId", payment.getOrderId(),
                            "paymentId", payment.getId(),
                            "status", payment.getStatus().name()
                    ))
                    .build());
            return;
        }
        if (payment.getStatus() == PaymentStatus.FAILED && previousStatus != PaymentStatus.FAILED) {
            backOfficeNotificationService.create(CreateBackOfficeNotificationRequest.builder()
                    .type(BackOfficeNotificationType.PAYMENT_FAILED)
                    .scope(BackOfficeNotificationScope.BACKOFFICE)
                    .targetRole(BackOfficeNotificationTargetRole.ADMIN)
                    .title("Paiement échoué")
                    .body("Le paiement de la commande ORD-" + payment.getOrderId() + " a échoué")
                    .actionPath("/finance")
                    .actionLabel("Ouvrir")
                    .severity(BackOfficeNotificationSeverity.ERROR)
                    .dedupeKey("PAYMENT_FAILED:" + payment.getOrderId())
                    .payload(java.util.Map.of(
                            "orderId", payment.getOrderId(),
                            "paymentId", payment.getId(),
                            "status", payment.getStatus().name()
                    ))
                    .build());
        }
    }
}
