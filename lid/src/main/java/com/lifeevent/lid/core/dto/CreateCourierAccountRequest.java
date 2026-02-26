package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourierAccountRequest(
        String prenom,
        String nom,
        @NotBlank @Email String email,
        String telephone,
        @NotBlank @Size(min = 6, max = 72) String password
) {
}

