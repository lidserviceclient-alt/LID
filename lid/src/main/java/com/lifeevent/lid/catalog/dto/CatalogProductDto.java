package com.lifeevent.lid.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CatalogProductDto(
        String id,
        String referenceProduitPartenaire,
        String name,
        String slug,
        BigDecimal price,
        String brand,
        String categoryId,
        String categoryName,
        String categorySlug,
        Boolean isFeatured,
        Boolean isBestSeller,
        String imageUrl,
        Integer stock,
        LocalDateTime dateCreation,
        Double rating,
        Long reviews
) {
}
