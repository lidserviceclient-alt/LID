package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record TopProductDto(
        String name,
        String category,
        BigDecimal revenue,
        String delta
) {
}

