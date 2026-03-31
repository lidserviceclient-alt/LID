package com.lifeevent.lid.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
