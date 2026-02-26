package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record ProductReviewDto(
        String id,
        String productId,
        String userId,
        String userName,
        Integer rating,
        String content,
        Long likeCount,
        Boolean likedByMe,
        LocalDateTime createdAt
) {
}

