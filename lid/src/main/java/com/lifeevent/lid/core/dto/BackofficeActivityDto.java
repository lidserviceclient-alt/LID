package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record BackofficeActivityDto(
        String id,
        String actor,
        String method,
        String path,
        Integer status,
        String summary,
        LocalDateTime createdAt
) {
}

