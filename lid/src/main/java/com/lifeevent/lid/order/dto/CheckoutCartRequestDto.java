package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutCartRequestDto {

    /**
     * Montant total à payer (optionnel)
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

    /**
     * Frais de livraison calculés côté front (optionnel)
     */
    private Double shippingCost;

    /**
     * Code promo (optionnel)
     */
    private String promoCode;

    /**
     * Items checkout (si le panier n'est pas stocké côté serveur)
     */
    private List<CheckoutItemRequestDto> items;

    /**
     * URLs de retour paiement (optionnel)
     */
    private String returnUrl;
    private String cancelUrl;
    private String paymentProvider;
}
