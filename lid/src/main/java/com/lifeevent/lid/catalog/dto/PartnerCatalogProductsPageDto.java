package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record PartnerCatalogProductsPageDto(
        List<PartnerCatalogProductDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
