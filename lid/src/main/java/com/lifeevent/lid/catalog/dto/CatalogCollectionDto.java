package com.lifeevent.lid.catalog.dto;

import com.lifeevent.lid.blog.dto.BlogPostDto;
import com.lifeevent.lid.ticket.dto.TicketEventDto;

import java.util.List;

public record CatalogCollectionDto(
        List<CatalogCategoryDto> categories,
        List<CatalogCategoryDto> featuredCategories,
        CatalogProductDto heroProduct,
        List<CatalogProductDto> featuredProducts,
        List<CatalogProductDto> bestSellerProducts,
        List<CatalogProductDto> latestProducts,
        CatalogProductsPageDto products,
        List<BlogPostDto> posts,
        List<TicketEventDto> tickets
) {
}
