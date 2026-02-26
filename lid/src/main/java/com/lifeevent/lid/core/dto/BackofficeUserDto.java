package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.RoleUtilisateur;

import java.time.LocalDateTime;
import java.util.List;

public record BackofficeUserDto(
        String id,
        String avatarUrl,
        String nom,
        String prenom,
        String email,
        Boolean emailVerifie,
        Boolean blocked,
        RoleUtilisateur role,
        String telephone,
        String ville,
        String pays,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour,
        List<BackofficeUserAuthDto> authentifications
) {
}
