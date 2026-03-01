package com.lifeevent.lid.catalog.dto;

import java.time.LocalDateTime;

public record CatalogCategoryDto(
        String id,
        String parentId,
        String parentName,
        String nom,
        String slug,
        String imageUrl,
        String niveau,
        Integer ordre,
        Boolean estActive,
        Boolean isFeatured,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour
) {
}
