package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogProductPageCollectionDto(
        CatalogProductDto product,
        List<CatalogProductDto> relatedProducts
) {
}
