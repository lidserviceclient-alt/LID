package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record UpdateFreeShippingRuleRequest(
        @NotNull @PositiveOrZero BigDecimal thresholdAmount,
        Boolean enabled,
        String progressMessageTemplate,
        String unlockedMessage
) {
}

