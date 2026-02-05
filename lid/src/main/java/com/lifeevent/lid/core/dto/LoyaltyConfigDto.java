package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record LoyaltyConfigDto(
        BigDecimal pointsPerFcfa,
        BigDecimal valuePerPointFcfa,
        int retentionDays
) {
}

