package com.lifeevent.lid.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateReturnRequestDto(
        @NotBlank String orderNumber,
        @NotBlank @Email String email,
        @NotBlank String reason,
        String details,
        @NotEmpty List<ReturnItemRequestDto> items
) {
}
