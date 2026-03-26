package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogPartnersPageDto(
        List<PartnerCatalogPartnerDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
