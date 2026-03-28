package com.lifeevent.lid.backoffice.lid.stock.dto;

import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.common.dto.PageResponse;

import java.util.List;

public record BackOfficeInventoryCollectionDto(
        PageResponse<BackOfficeProductDto> productsPage,
        List<BackOfficeCategoryDto> categories,
        PageResponse<BackOfficeStockMovementDto> movementsPage
) {
}
