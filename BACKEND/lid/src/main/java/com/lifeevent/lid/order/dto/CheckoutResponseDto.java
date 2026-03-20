package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse du checkout
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponseDto {
    
    /**
     * ID de la commande créée
     */
    private Long orderId;
    
    /**
     * Montant à payer
     */
    private Double amount;
    
    /**
     * URL de redirection vers le paiement PayDunya
     */
    private String paymentUrl;
    
    /**
     * Token de la facture (invoice token)
     */
    private String invoiceToken;
}
