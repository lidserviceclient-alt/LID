package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.util.List;

public record PromoCodeStatsDto(
        int days,
        List<Integer> usageSeries,
        long totalUsages,
        BigDecimal totalReduction
) {
}

