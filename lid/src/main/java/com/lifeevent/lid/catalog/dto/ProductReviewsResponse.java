package com.lifeevent.lid.catalog.dto;

import java.util.List;

public record ProductReviewsResponse(
        double avgRating,
        long reviewCount,
        List<ProductReviewDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
