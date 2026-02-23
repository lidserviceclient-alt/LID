package com.lifeevent.lid.wishlist.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la wishlist
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDto {
    
    /**
     * Product id (UUID) from core catalog.
     */
    private String id;

    /**
     * Référence/SKU partenaire (utilisée pour checkout/promo si besoin).
     */
    private String referenceProduitPartenaire;
    
    private String name;

    private String image;

    private BigDecimal price;

    private Boolean isFeatured;

    private Boolean isBestSeller;
}
