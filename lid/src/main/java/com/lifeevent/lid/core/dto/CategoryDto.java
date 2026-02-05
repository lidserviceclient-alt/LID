package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.NiveauCategorie;

import java.time.LocalDateTime;

public record CategoryDto(
        String id,
        String parentId,
        String parentName,
        String nom,
        String slug,
        String imageUrl,
        NiveauCategorie niveau,
        Integer ordre,
        Boolean estActive,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour
) {
}

