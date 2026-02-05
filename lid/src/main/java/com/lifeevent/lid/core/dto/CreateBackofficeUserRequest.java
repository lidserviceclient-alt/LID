package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.RoleUtilisateur;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBackofficeUserRequest(
        String avatarUrl,
        String nom,
        String prenom,
        @NotBlank @Email String email,
        Boolean emailVerifie,
        @NotNull RoleUtilisateur role,
        String telephone,
        String ville,
        String pays
) {
}

