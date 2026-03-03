package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record CatalogCollectionDto(
        List<CatalogCategoryDto> categories,
        List<CatalogCategoryDto> featuredCategories,
        CatalogProductDto heroProduct,
        List<CatalogProductDto> featuredProducts,
        List<CatalogProductDto> bestSellerProducts,
        List<CatalogProductDto> latestProducts,
        CatalogProductsPageDto products
) {
}
