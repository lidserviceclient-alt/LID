package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateBackofficeMessageRequest(
        @NotBlank String subject,
        @NotBlank String body,
        List<String> recipients
) {
}

