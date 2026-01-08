package com.lifeevent.lid.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour un item du panier (CartArticle)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    
    private Integer id;
    
    private Long articleId;
    
    private String articleName;
    
    private String articleImage;
    
    private Integer quantity;
    
    private Double price;
    
    private Double priceAtAddedTime;
    
    /**
     * Sous-total (price * quantity)
     */
    private Double subtotal;
}
