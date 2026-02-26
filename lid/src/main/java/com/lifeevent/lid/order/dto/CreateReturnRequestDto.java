package com.lifeevent.lid.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.validation.Valid;
import java.util.List;

public record CreateReturnRequestDto(
        @NotBlank String orderNumber,
        @NotBlank String email,
        @NotBlank @Size(max = 100) String reason,
        @Size(max = 2000) String details,
        List<@Valid ReturnItemRequestDto> items
) {
}
