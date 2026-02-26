package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;

public record UpsertSocialLinkRequest(
        @NotBlank String platform,
        @NotBlank String url,
        Integer sortOrder
) {
}

