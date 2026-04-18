package com.lifeevent.lid.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.lifeevent.lid.common.enumeration.CommerceItemType;

/**
 * DTO pour ajouter/modifier un item du panier
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartDto {
    
    /**
     * ID de l'article
     */
    private Long articleId;

    /**
     * ID de l'évènement ticket
     */
    private Long ticketEventId;

    /**
     * Type de ligne du panier.
     */
    private CommerceItemType itemType;
    
    /**
     * Quantité à ajouter
     */
    private Integer quantity;

    /**
     * Variante optionnelle.
     */
    private String color;

    /**
     * Taille optionnelle.
     */
    private String size;
}
