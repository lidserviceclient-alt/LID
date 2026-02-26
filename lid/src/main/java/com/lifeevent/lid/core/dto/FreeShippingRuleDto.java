package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FreeShippingRuleDto(
        String id,
        Boolean enabled,
        BigDecimal thresholdAmount,
        String progressMessageTemplate,
        String unlockedMessage,
        LocalDateTime updatedAt
) {
}

