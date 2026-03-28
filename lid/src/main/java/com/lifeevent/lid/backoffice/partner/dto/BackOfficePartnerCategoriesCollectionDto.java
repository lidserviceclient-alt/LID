package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.catalog.dto.CatalogCategoryDto;

import java.util.List;

public record BackOfficePartnerCategoriesCollectionDto(
        List<CatalogCategoryDto> categories,
        List<PartnerSubCategoryDto> categoriesCrud
) {
}
