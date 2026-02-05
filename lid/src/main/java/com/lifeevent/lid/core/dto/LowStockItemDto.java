package com.lifeevent.lid.core.dto;

public record LowStockItemDto(
        String name,
        String sku,
        int stock,
        int threshold,
        String supplier
) {
}

