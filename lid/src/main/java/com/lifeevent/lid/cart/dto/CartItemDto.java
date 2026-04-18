package com.lifeevent.lid.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.lifeevent.lid.common.enumeration.CommerceItemType;

/**
 * DTO pour un item du panier (CartArticle)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    
    private Integer id;

    private CommerceItemType itemType;
    
    private Long articleId;

    private Long ticketEventId;

    private String sku;

    private String referenceProduitPartenaire;
    
    private String articleName;
    
    private String articleImage;

    private String color;

    private String size;
    
    private Integer quantity;
    
    private Double price;
    
    private Double priceAtAddedTime;
    
    /**
     * Sous-total (price * quantity)
     */
    private Double subtotal;
}
