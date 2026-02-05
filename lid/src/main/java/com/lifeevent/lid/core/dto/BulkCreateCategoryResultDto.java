package com.lifeevent.lid.core.dto;

public record BulkCreateCategoryResultDto(
        int index,
        String name,
        boolean success,
        String id,
        String errorMessage
) {
}
