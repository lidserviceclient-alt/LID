package com.lifeevent.lid.catalog.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PartnerCatalogProductDto(
        Long id,
        String name,
        String sku,
        String ean,
        Double price,
        Double initialPrice,
        String mainImageUrl,
        List<String> secondaryImageUrls,
        String brand,
        LocalDateTime createdAt
) {
}
