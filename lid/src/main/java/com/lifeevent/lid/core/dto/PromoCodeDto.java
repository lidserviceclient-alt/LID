package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.CibleCodePromo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromoCodeDto(
        String id,
        String code,
        String description,
        BigDecimal pourcentage,
        CibleCodePromo cible,
        String boutiqueId,
        String boutiqueNom,
        String utilisateurId,
        String utilisateurEmail,
        BigDecimal montantMinCommande,
        LocalDateTime dateDebut,
        LocalDateTime dateFin,
        Integer usageMax,
        Integer usageMaxParUtilisateur,
        Boolean estActif,
        LocalDateTime dateCreation,
        long usageCount,
        BigDecimal totalReduction
) {
}

