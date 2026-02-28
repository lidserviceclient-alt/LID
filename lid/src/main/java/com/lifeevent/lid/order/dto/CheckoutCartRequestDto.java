package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutCartRequestDto {

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
