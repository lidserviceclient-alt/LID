package com.lifeevent.lid.payment.dto;

import com.lifeevent.lid.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO pour la réponse de remboursement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponseDto {
    
    private Long id;
    private Long paymentId;
    private BigDecimal amount;
    private String reason;
    private String status;
    private LocalDateTime processedDate;
    private String refundId;
    private LocalDateTime createdAt;
}
