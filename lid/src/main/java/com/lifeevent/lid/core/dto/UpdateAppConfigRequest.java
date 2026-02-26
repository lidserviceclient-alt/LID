package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateAppConfigRequest(
        @NotBlank String storeName,
        @NotBlank @Email String contactEmail,
        @NotBlank String contactPhone,
        @NotBlank String city,
        String logoUrl,
        String slogan,
        String activitySector
) {
}
