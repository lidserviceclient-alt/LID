package com.lifeevent.lid.catalog.dto;

import java.time.LocalDateTime;

public record PartnerCatalogProductDto(
        Long id,
        String name,
        String sku,
        String ean,
        Double price,
        String imageUrl,
        String brand,
        LocalDateTime createdAt
) {
}
