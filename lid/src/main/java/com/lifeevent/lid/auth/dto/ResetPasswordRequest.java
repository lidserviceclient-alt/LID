package com.lifeevent.lid.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    private String code;

    @NotBlank
    @Size(min = 8)
    private String newPassword;
}
