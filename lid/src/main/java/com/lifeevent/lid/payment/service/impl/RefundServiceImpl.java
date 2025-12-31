package com.lifeevent.lid.payment.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.payment.dto.RefundRequestDto;
import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.PaymentTransaction;
import com.lifeevent.lid.payment.entity.Refund;
import com.lifeevent.lid.payment.enums.PaymentStatus;
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
        
        return mapToDto(savedRefund);
    }
    
    @Override
    public List<RefundResponseDto> getRefundsByPaymentId(Long paymentId) {
        return refundRepository.findByPaymentId(paymentId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public RefundResponseDto getRefundById(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId.toString()));
        return mapToDto(refund);
    }
    
    @Override
    public List<RefundResponseDto> getPendingRefunds() {
        return refundRepository.findByStatus("PENDING")
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public void processRefund(Long refundId) {
        log.info("Traitement du remboursement: {}", refundId);
        
        Refund refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId.toString()));
        
        try {
            // TODO: Implémenter l'appel à l'API PayDunya pour traiter le remboursement
            // Une fois l'API PayDunya supportant les remboursements, l'intégrer ici
            
            refund.setStatus("PROCESSING");
            refund.setProcessedDate(LocalDateTime.now());
            refundRepository.save(refund);
            
            // Enregistrer la transaction
            saveTransaction(refund.getPayment(), "REFUND_PROCESSING", 
                refund.getPayment().getStatus().getCode(),
                "Remboursement en cours de traitement", "API");
            
            log.info("Remboursement marqué comme en traitement: {}", refundId);
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
    
    private RefundResponseDto mapToDto(Refund refund) {
        return RefundResponseDto.builder()
            .id(refund.getId())
            .paymentId(refund.getPayment().getId())
            .amount(refund.getAmount())
            .reason(refund.getReason())
            .status(refund.getStatus())
            .processedDate(refund.getProcessedDate())
            .refundId(refund.getRefundId())
            .createdAt(refund.getCreatedAt())
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
}
