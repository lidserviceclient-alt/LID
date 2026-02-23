package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO complet pour la page produit (catalog public).
 * Différent du {@link CatalogProductDto} utilisé pour les listes (plus léger).
 */
public record CatalogProductDetailsDto(
        String id,
        String referenceProduitPartenaire,
        String name,
        String slug,
        BigDecimal price,
        String brand,
        String description,
        BigDecimal vat,
        String categoryId,
        String categoryName,
        String categorySlug,
        Boolean isFeatured,
        Boolean isBestSeller,
        String imageUrl,
        List<String> images,
        Integer stock,
        LocalDateTime dateCreation
) {
}

