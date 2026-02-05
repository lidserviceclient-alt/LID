package com.lifeevent.lid.core.dto;

import java.util.List;

public record BulkDeleteCategoriesResponse(
        int requested,
        int deactivated,
        List<String> notFoundIds
) {
}
