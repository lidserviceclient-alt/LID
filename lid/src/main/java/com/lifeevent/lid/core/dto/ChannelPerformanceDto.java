package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record ChannelPerformanceDto(
        String channel,
        double sharePercent,
        BigDecimal revenue
) {
}

