package com.lifeevent.lid.core.dto;

import java.util.List;

public record BulkCreateProductsResponse(
        int total,
        int created,
        List<BulkCreateProductResultDto> results
) {
}

