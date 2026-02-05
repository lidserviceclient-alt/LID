package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record LogisticsKpiDto(
        long inTransitCount,
        double avgDelayDays,
        BigDecimal avgCost
) {
}

