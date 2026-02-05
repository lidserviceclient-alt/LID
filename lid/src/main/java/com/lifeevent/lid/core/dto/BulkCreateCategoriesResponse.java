package com.lifeevent.lid.core.dto;

import java.util.List;

public record BulkCreateCategoriesResponse(
        int total,
        int created,
        List<BulkCreateCategoryResultDto> results
) {
}
