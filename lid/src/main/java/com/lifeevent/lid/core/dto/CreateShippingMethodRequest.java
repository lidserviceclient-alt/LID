package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CreateShippingMethodRequest(
        @NotBlank String code,
        @NotBlank String label,
        String description,
        @NotNull @PositiveOrZero BigDecimal costAmount,
        Boolean enabled,
        Boolean isDefault,
        Integer sortOrder
) {
}

