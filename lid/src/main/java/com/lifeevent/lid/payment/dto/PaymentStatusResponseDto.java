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

    /**
     * Résultat du traitement post-paiement (création client/commande/livraison).
     * Null si le paiement n'est pas encore COMPLETED.
     */
    private Boolean postPaymentSyncOk;
    private String postPaymentSyncError;
    private String coreOrderId;
    private String coreShipmentId;
}
