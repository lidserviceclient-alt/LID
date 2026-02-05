package com.lifeevent.lid.core.dto;

public record BulkCreateProductResultDto(
        int index,
        String reference,
        String name,
        boolean success,
        String productId,
        String errorMessage
) {
}

