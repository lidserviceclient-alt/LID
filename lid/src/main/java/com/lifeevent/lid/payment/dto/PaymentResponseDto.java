package com.lifeevent.lid.payment.dto;

import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO pour les réponses de paiement
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponseDto {
    
    private Long id;
    private Long orderId;
    private String invoiceToken;
    private BigDecimal amount;
    private String currency;
    private String description;
    private PaymentOperator operator;
    private PaymentStatus status;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String receiptUrl;
    private String returnUrl;
    private LocalDateTime paymentDate;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
