package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShippingMethodDto(
        String id,
        String code,
        String label,
        String description,
        BigDecimal costAmount,
        Boolean enabled,
        Boolean isDefault,
        Integer sortOrder,
        LocalDateTime updatedAt
) {
}

