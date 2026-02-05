package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.util.List;

public record MarketingOverviewDto(
        double roiGlobal,
        BigDecimal budgetSpent,
        List<ChannelPerformanceDto> channels
) {
}

