package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour initier un checkout
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDto {
    
    /**
     * Montant total à payer (TTC)
     */
    private Double amount;
    
    /**
     * Devise (ex: FCFA, EUR)
     */
    private String currency;
    
    /**
     * Email du client pour la facturation
     */
    private String email;
    
    /**
     * Numéro de téléphone
     */
    private String phone;
    
    /**
     * Adresse de livraison
     */
    private String shippingAddress;
    
    /**
     * Remarques optionnelles
     */
    private String notes;
}
