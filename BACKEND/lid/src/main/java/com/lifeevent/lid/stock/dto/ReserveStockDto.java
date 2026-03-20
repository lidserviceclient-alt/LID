package com.lifeevent.lid.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les opérations de réservation de stock
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReserveStockDto {
    /**
     * ID de l'article à réserver
     */
    private Long articleId;
    
    /**
     * Quantité à réserver
     */
    private Integer quantity;
    
    /**
     * Identifiant du panier (pour l'idempotence)
     */
    private Integer cartId;
}
