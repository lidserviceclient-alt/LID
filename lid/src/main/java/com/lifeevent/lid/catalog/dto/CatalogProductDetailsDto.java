package com.lifeevent.lid.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CatalogProductDetailsDto(
        String id,
        String referenceProduitPartenaire,
        String name,
        String slug,
        BigDecimal price,
        BigDecimal initialPrice,
        String brand,
        String description,
        BigDecimal vat,
        String categoryId,
        String categoryName,
        String categorySlug,
        Boolean isFeatured,
        Boolean isBestSeller,
        String mainImageUrl,
        List<String> secondaryImageUrls,
        List<String> images,
        Integer stock,
        LocalDateTime dateCreation
) {
}
