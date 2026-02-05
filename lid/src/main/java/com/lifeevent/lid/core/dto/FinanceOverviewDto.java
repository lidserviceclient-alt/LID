package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FinanceOverviewDto(
        BigDecimal availableBalance,
        BigDecimal inflows,
        BigDecimal outflows,
        BigDecimal pending,
        LocalDateTime updatedAt
) {
}

