package com.lifeevent.lid.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryLoginRequest(
        @NotBlank String phoneNumber,
        @NotBlank String password
) {
}
