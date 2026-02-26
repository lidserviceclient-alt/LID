package com.lifeevent.lid.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReturnItemRequestDto(
        @NotNull Long articleId,
        @NotNull @Min(1) Integer quantity
) {
}

