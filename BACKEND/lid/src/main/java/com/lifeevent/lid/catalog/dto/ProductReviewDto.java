package com.lifeevent.lid.catalog.dto;

import java.time.LocalDateTime;

public record ProductReviewDto(
        String id,
        String productId,
        String userId,
        String userName,
        String userAvatarUrl,
        Integer rating,
        String content,
        Long likeCount,
        Boolean likedByMe,
        LocalDateTime createdAt
) {
}
