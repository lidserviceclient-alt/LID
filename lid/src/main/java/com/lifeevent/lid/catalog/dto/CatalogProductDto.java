package com.lifeevent.lid.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
        String mainImageUrl,
        List<String> secondaryImageUrls,
        Integer stock,
        LocalDateTime dateCreation,
        Double rating,
        Long reviews
) {
}
