package com.lifeevent.lid.core.dto;

import java.util.List;

public record BulkDeleteProductsResponse(
        int requested,
        int archived,
        List<String> notFoundIds
) {
}
