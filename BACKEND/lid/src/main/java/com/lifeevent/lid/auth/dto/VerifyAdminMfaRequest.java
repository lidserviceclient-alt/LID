package com.lifeevent.lid.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyAdminMfaRequest(
        @NotBlank String mfaTokenId,
        @NotBlank String code
) {
}
