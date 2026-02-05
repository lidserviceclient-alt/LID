package com.lifeevent.lid.core.dto;

public record PurgeCatalogResponse(
        long deletedCategories,
        long deletedProducts,
        int updatedOrderLines,
        int deletedCartLines
) {
}
