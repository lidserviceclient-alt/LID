package com.lifeevent.lid.catalog.dto;

public record PartnerCatalogPartnerCollectionDto(
        PartnerCatalogPartnerDto partner,
        long products,
        PartnerCatalogProductsPageDto productsPage
) {
}
