package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogProductsPageDto(
        List<CatalogProductDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
