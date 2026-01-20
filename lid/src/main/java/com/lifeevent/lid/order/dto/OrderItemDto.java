package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour un article d'une commande
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    
    private Long articleId;
    
    private String articleName;
    
    private Integer quantity;
    
    private Double priceAtOrder;
    
    /**
     * Sous-total (priceAtOrder * quantity)
     */
    private Double subtotal;
}
