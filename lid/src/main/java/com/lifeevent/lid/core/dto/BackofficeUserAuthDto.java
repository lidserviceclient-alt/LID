package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.FournisseurAuth;

import java.time.LocalDateTime;

public record BackofficeUserAuthDto(
        FournisseurAuth fournisseur,
        String identifiantFournisseur,
        LocalDateTime dateCreation
) {
}

