package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogProductPageCollectionDto(
        CatalogProductDetailsDto product,
        List<CatalogProductDto> relatedProducts
) {
}
