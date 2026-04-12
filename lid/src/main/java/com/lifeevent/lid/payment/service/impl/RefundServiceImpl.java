package com.lifeevent.lid.payment.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.util.PhoneNumberUtils;
import com.lifeevent.lid.payment.dto.RefundRequestDto;
import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementResult;
import com.lifeevent.lid.payment.disbursement.service.PaydunyaDisbursementService;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.PaymentTransaction;
import com.lifeevent.lid.payment.entity.Refund;
import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.mapper.RefundMapper;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.PaymentTransactionRepository;
import com.lifeevent.lid.payment.repository.RefundRepository;
import com.lifeevent.lid.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de remboursement
 * Gère les demandes et le traitement des remboursements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RefundServiceImpl implements RefundService {
    
    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final RefundMapper refundMapper;
    private final PaydunyaDisbursementService paydunyaDisbursementService;
    
    @Override
    public RefundResponseDto requestRefund(RefundRequestDto request) {
        log.info("Demande de remboursement pour le paiement: {}", request.getPaymentId());
        
        Payment payment = paymentRepository.findById(request.getPaymentId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", 
                request.getPaymentId().toString()));
        
        // Vérifier que le paiement est complété
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Seuls les paiements complétés peuvent être remboursés");
        }
        
        // Vérifier que le montant ne dépasse pas le montant du paiement
        if (request.getAmount().compareTo(payment.getAmount()) > 0) {
            throw new IllegalArgumentException("Le montant du remboursement ne peut pas dépasser le montant du paiement");
        }
        
        // Créer la demande de remboursement
        Refund refund = Refund.builder()
            .payment(payment)
            .amount(request.getAmount())
            .reason(request.getReason())
            .status("PENDING")
            .build();
        
        Refund savedRefund = refundRepository.save(refund);
        
        // Enregistrer la transaction
        saveTransaction(payment, "REFUND_REQUESTED", PaymentStatus.COMPLETED.getCode(),
            "Remboursement demandé: " + request.getAmount(), "API");
        
        log.info("Demande de remboursement créée: {}", savedRefund.getId());
        
        return refundMapper.toDto(savedRefund);
    }
    
    @Override
    public List<RefundResponseDto> getRefundsByPaymentId(Long paymentId) {
        return refundMapper.toDtoList(refundRepository.findByPaymentId(paymentId));
    }
    
    @Override
    public RefundResponseDto getRefundById(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId.toString()));
        return refundMapper.toDto(refund);
    }
    
    @Override
    public List<RefundResponseDto> getPendingRefunds() {
        return refundMapper.toDtoList(refundRepository.findByStatus("PENDING"));
    }
    
    @Override
    public void processRefund(Long refundId) {
        log.info("Traitement du remboursement: {}", refundId);
        
        Refund refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId.toString()));
        
        try {
            Payment payment = refund.getPayment();
            if (payment != null && payment.getInvoiceToken() != null && payment.getInvoiceToken().startsWith("LOCAL-")) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);

                refund.setStatus("COMPLETED");
                refund.setProcessedDate(LocalDateTime.now());
                refund.setRefundId("LOCAL-REFUND-" + refund.getId());
                refundRepository.save(refund);

                saveTransaction(payment, "REFUND_COMPLETED",
                        PaymentStatus.REFUNDED.getCode(),
                        "Remboursement local complété", "LOCAL");
                log.info("Remboursement local complété: {}", refundId);
                return;
            }

            String accountAlias = resolveDisbursementAccountAlias(payment);
            String withdrawMode = resolveDisbursementWithdrawMode(payment == null ? null : payment.getOperator());
            PaydunyaDisbursementResult result = paydunyaDisbursementService.disburse(
                    accountAlias,
                    refund.getAmount(),
                    withdrawMode,
                    "REFUND-" + refund.getId()
            );

            refund.setStatus(result.success() ? "COMPLETED" : "PROCESSING");
            refund.setProcessedDate(LocalDateTime.now());
            refund.setRefundId(result.transactionId() == null || result.transactionId().isBlank()
                    ? result.disburseInvoice()
                    : result.transactionId());
            refundRepository.save(refund);

            if (result.success()) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
                saveTransaction(payment, "REFUND_COMPLETED",
                        PaymentStatus.REFUNDED.getCode(),
                        "Remboursement PayDunya complété", "API");
                log.info("Remboursement PayDunya complété: {}", refundId);
                return;
            }

            saveTransaction(refund.getPayment(), "REFUND_PROCESSING",
                    refund.getPayment().getStatus().getCode(),
                    "Remboursement PayDunya en cours", "API");

            log.info("Remboursement PayDunya en cours: {}", refundId);
        } catch (Exception e) {
            log.error("Erreur lors du traitement du remboursement", e);
            refund.setStatus("FAILED");
            refundRepository.save(refund);
            saveTransaction(refund.getPayment(), "REFUND_FAILED",
                refund.getPayment().getStatus().getCode(),
                "Erreur: " + e.getMessage(), "API");
            throw new RuntimeException("Erreur lors du traitement du remboursement", e);
        }
    }
    
    @Override
    public void cancelRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId.toString()));
        
        if (!"PENDING".equals(refund.getStatus())) {
            throw new IllegalStateException("Seuls les remboursements en attente peuvent être annulés");
        }
        
        refund.setStatus("CANCELLED");
        refundRepository.save(refund);
        
        saveTransaction(refund.getPayment(), "REFUND_CANCELLED",
            refund.getPayment().getStatus().getCode(),
            "Remboursement annulé", "API");
        
        log.info("Remboursement annulé: {}", refundId);
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

    private String resolveDisbursementAccountAlias(Payment payment) {
        String alias = PhoneNumberUtils.toNationalSignificantNumberOrNull(payment == null ? null : payment.getCustomerPhone());
        if (alias == null || alias.isBlank()) {
            throw new IllegalStateException("Téléphone client invalide pour déboursement");
        }
        return alias;
    }

    private String resolveDisbursementWithdrawMode(PaymentOperator operator) {
        if (operator == null) {
            throw new IllegalStateException("Opérateur de paiement introuvable pour le déboursement");
        }
        return switch (operator) {
            case ORANGE_MONEY_CI -> "orange-money-ci";
            case MTN_MONEY_CI -> "mtn-ci";
            case WAVE_CI -> "wave-ci";
            case ORANGE_MONEY_SENEGAL -> "orange-money-senegal";
            case WAVE_SENEGAL -> "wave-senegal";
            default -> throw new IllegalStateException("Withdraw mode PayDunya non supporté pour " + operator.name());
        };
    }
}
