package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record BackofficeProductReviewDto(
        String id,
        String productId,
        String productName,
        String userId,
        String userEmail,
        Integer rating,
        String content,
        Boolean validated,
        Long likeCount,
        Long reportCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
}

