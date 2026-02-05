package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record LoyaltyOverviewDto(
        long vipMembers,
        long pointsDistributed,
        BigDecimal pointsValueFcfa,
        double retentionRate
) {
}

