package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record LoyaltyTxDto(
        String id,
        String type,
        Integer points,
        String reason,
        String commandeId,
        LocalDateTime createdAt
) {
}

