package com.lifeevent.lid.core.dto;

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

