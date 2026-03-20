package com.lifeevent.lid.payment.dto;

import com.lifeevent.lid.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse de vérification du statut de paiement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusResponseDto {
    
    private Long paymentId;
    private String invoiceToken;
    private PaymentStatus status;
    private String statusLabel;
    private String responseCode;
    private String responseText;
    private String receiptUrl;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
