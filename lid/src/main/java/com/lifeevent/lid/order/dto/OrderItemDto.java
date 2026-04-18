package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.lifeevent.lid.common.enumeration.CommerceItemType;

/**
 * DTO pour un article d'une commande
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private CommerceItemType itemType;
    
    private Long articleId;

    private Long ticketEventId;
    
    private String articleName;
    
    private Integer quantity;
    
    private Double priceAtOrder;
    
    /**
     * Sous-total (priceAtOrder * quantity)
     */
    private Double subtotal;
}
