package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.RoleUtilisateur;
import jakarta.validation.constraints.Email;

public record UpdateBackofficeUserRequest(
        String avatarUrl,
        String nom,
        String prenom,
        @Email String email,
        Boolean emailVerifie,
        RoleUtilisateur role,
        String telephone,
        String ville,
        String pays
) {
}

