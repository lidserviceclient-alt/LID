package com.lifeevent.lid.payment.service.impl;

import com.paydunya.neptune.PaydunyaCheckoutInvoice;
import com.paydunya.neptune.PaydunyaSetup;
import com.paydunya.neptune.PaydunyaCheckoutStore;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentStatusResponseDto;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.PaymentTransaction;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.PaymentTransactionRepository;
import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.payment.service.PaydunyaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final PaydunyaSetup paydunyaSetup;
    private final PaydunyaCheckoutStore paydunyaStore;
    
    @Override
    public PaymentResponseDto createPayment(CreatePaymentRequestDto request) {
//        log.info("Création d'un paiement pour la commande: {}", request.getOrderId());
//
//        try {
//            // Créer une instance de facture PayDunya
//            PaydunyaCheckoutInvoice invoice = new PaydunyaCheckoutInvoice(paydunyaSetup, paydunyaStore);
//
//            // Ajouter les articles
//            if (request.getItems() != null && !request.getItems().isEmpty()) {
//                request.getItems().forEach(item ->
//                    invoice.addItem(
//                        item.getName(),
//                        item.getQuantity(),
//                        item.getUnitPrice().doubleValue(),
//                        item.getTotalPrice().doubleValue(),
//                        item.getDescription()
//                    )
//                );
//            }
//
//            // Ajouter les taxes
//            if (request.getTaxes() != null && !request.getTaxes().isEmpty()) {
//                request.getTaxes().forEach(tax ->
//                    invoice.addTax(tax.getName(), tax.getAmount().doubleValue())
//                );
//            }
//
//            // Ajouter l'opérateur de paiement
//            invoice.addChannel(request.getOperator().getOperatorCode());
//
//            // Configurer le montant total
//            invoice.setTotalAmount(request.getAmount().doubleValue());
//
//            // Configurer la description
//            invoice.setDescription(request.getDescription());
//
//            // Configurer les URLs de redirection
//            invoice.setReturnUrl(request.getReturnUrl());
//            invoice.setCancelUrl(request.getCancelUrl());
//            invoice.setCallbackUrl(properties.getCallbackUrl());
//
//            // Ajouter les données du client
//            invoice.addCustomData("orderId", request.getOrderId());
//            invoice.addCustomData("customerEmail", request.getCustomerEmail());
//            invoice.addCustomData("operator", request.getOperator().getDisplayName());
//
//            // Créer la facture sur les serveurs PayDunya
//            if (invoice.create()) {
//                log.info("Facture créée avec succès. Token: {}", invoice.getToken());
//
//                // Sauvegarder le paiement en base de données
//                Payment payment = Payment.builder()
//                    .orderId(request.getOrderId())
//                    .invoiceToken(invoice.getToken())
//                    .amount(request.getAmount())
//                    .currency("XOF")
//                    .description(request.getDescription())
//                    .operator(request.getOperator())
//                    .status(PaymentStatus.PENDING)
//                    .customerName(request.getCustomerName())
//                    .customerEmail(request.getCustomerEmail())
//                    .customerPhone(request.getCustomerPhone())
//                    .returnUrl(request.getReturnUrl())
//                    .cancelUrl(request.getCancelUrl())
//                    .build();
//
//                Payment savedPayment = paymentRepository.save(payment);
//
//                // Enregistrer la transaction
//                saveTransaction(savedPayment, "CREATION", PaymentStatus.PENDING.getCode(),
//                    "Paiement créé, token: " + invoice.getToken(), "API");
//
//                return mapToDto(savedPayment);
//            } else {
//                log.error("Échec de la création de la facture PayDunya. Code: {}, Message: {}",
//                    invoice.getResponseCode(), invoice.getResponseText());
//                throw new RuntimeException("Impossible de créer la facture de paiement: " + invoice.getResponseText());
//            }
//        } catch (Exception e) {
//            log.error("Erreur lors de la création du paiement", e);
//            throw new RuntimeException("Erreur lors de la création du paiement", e);
//        }
        return null;
    }
    
    @Override
    public PaymentStatusResponseDto verifyPaymentStatus(String invoiceToken) {
//        log.info("Vérification du statut du paiement: {}", invoiceToken);
//
//        Payment payment = paymentRepository.findByInvoiceToken(invoiceToken)
//            .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));
//
//        try {
//            PaydunyaCheckoutInvoice invoice = new PaydunyaCheckoutInvoice(paydunyaSetup, paydunyaStore);
//
//            if (invoice.confirm(invoiceToken)) {
//                String statusCode = invoice.getStatus();
//                PaymentStatus status = PaymentStatus.fromCode(statusCode);
//
//                // Mettre à jour le paiement
//                payment.setStatus(status);
//                payment.setPaydunyaHash(invoice.getResponseText());
//
//                if ("completed".equals(statusCode)) {
//                    payment.setPaymentDate(LocalDateTime.now());
//                    payment.setReceiptUrl(invoice.getReceiptUrl());
//                    payment.setCustomerName(invoice.getCustomerInfo("name"));
//                    payment.setCustomerEmail(invoice.getCustomerInfo("email"));
//                    payment.setCustomerPhone(invoice.getCustomerInfo("phone"));
//                }
//
//                paymentRepository.save(payment);
//
//                // Enregistrer la transaction
//                saveTransaction(payment, "CONFIRMATION", statusCode,
//                    "Statut confirmé: " + invoice.getResponseText(), "API");
//
//                return buildStatusResponse(payment, invoice);
//            } else {
//                log.warn("Impossible de confirmer le paiement: {}", invoice.getResponseText());
//                saveTransaction(payment, "CONFIRMATION_FAILED", payment.getStatus().getCode(),
//                    "Erreur: " + invoice.getResponseText(), "API");
//
//                return buildStatusResponse(payment, invoice);
//            }
//        } catch (Exception e) {
//            log.error("Erreur lors de la vérification du paiement", e);
//            throw new RuntimeException("Erreur lors de la vérification du paiement", e);
//        }
        return null;
    }
    
    @Override
    public PaymentResponseDto getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId.toString()));
        return mapToDto(payment);
    }
    
    @Override
    public List<PaymentResponseDto> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PaymentResponseDto> getPaymentsByCustomerEmail(String customerEmail) {
        return paymentRepository.findByCustomerEmail(customerEmail)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public void processPaymentCallback(String invoiceToken) {
        log.info("Traitement du callback PayDunya pour le token: {}", invoiceToken);
        
        Payment payment = paymentRepository.findByInvoiceToken(invoiceToken)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "invoiceToken", invoiceToken));
        
        try {
            PaydunyaCheckoutInvoice invoice = new PaydunyaCheckoutInvoice(paydunyaSetup, paydunyaStore);
            
            if (invoice.confirm(invoiceToken)) {
                String statusCode = invoice.getStatus();
                PaymentStatus status = PaymentStatus.fromCode(statusCode);
                
                payment.setStatus(status);
                payment.setPaydunyaHash(invoice.getResponseText());
                
                if ("completed".equals(statusCode)) {
                    payment.setPaymentDate(LocalDateTime.now());
                    payment.setReceiptUrl(invoice.getReceiptUrl());
                }
                
                paymentRepository.save(payment);
                saveTransaction(payment, "WEBHOOK_RECEIVED", statusCode, 
                    "Callback reçu et traité", "WEBHOOK");
                
                log.info("Callback traité avec succès. Statut: {}", status);
            }
        } catch (Exception e) {
            log.error("Erreur lors du traitement du callback", e);
            saveTransaction(payment, "WEBHOOK_ERROR", payment.getStatus().getCode(),
                "Erreur: " + e.getMessage(), "WEBHOOK");
            throw new RuntimeException("Erreur lors du traitement du callback", e);
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
    
    private PaymentResponseDto mapToDto(Payment payment) {
        return PaymentResponseDto.builder()
            .id(payment.getId())
            .orderId(payment.getOrderId())
            .invoiceToken(payment.getInvoiceToken())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .description(payment.getDescription())
            .operator(payment.getOperator())
            .status(payment.getStatus())
            .customerName(payment.getCustomerName())
            .customerEmail(payment.getCustomerEmail())
            .customerPhone(payment.getCustomerPhone())
            .receiptUrl(payment.getReceiptUrl())
            .returnUrl(payment.getReturnUrl())
            .paymentDate(payment.getPaymentDate())
            .failureReason(payment.getFailureReason())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
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
}
