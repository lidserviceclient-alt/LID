package com.lifeevent.lid.backoffice.lid.product.dto;

import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.common.dto.PageResponse;

import java.util.List;

public record BackOfficeProductCollectionDto(
        PageResponse<BackOfficeProductDto> productsPage,
        List<BackOfficeCategoryDto> categories
) {
}
