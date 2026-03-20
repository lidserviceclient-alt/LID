package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogLayoutCollectionDto(
        List<CatalogCategoryDto> categories,
        List<CatalogProductDto> latestProducts
) {
}
