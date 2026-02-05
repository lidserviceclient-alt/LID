package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.BackofficeMessageStatus;

import java.time.LocalDateTime;
import java.util.List;

public record BackofficeMessageDto(
        String id,
        String subject,
        String body,
        List<String> recipients,
        BackofficeMessageStatus status,
        int attempts,
        String lastError,
        LocalDateTime nextRetryAt,
        LocalDateTime sentAt,
        LocalDateTime createdAt,
        String createdBy
) {
}

