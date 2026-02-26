package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record FreeShippingConfigDto(
        String id,
        Boolean enabled,
        BigDecimal thresholdAmount,
        String progressMessageTemplate,
        String unlockedMessage
) {
}

