package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.TypeMouvementStock;

import java.time.LocalDateTime;

public record StockMovementDto(
        String id,
        String sku,
        String productName,
        TypeMouvementStock type,
        Integer quantity,
        Integer stockBefore,
        Integer stockAfter,
        String reference,
        LocalDateTime createdAt
) {
}
