package com.lifeevent.lid.backoffice.lid.promo.dto;

import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficePromoCodeDto {
    private Long id;
    private String code;
    private String description;

    // Pourcentage de remise (front)
    private Double pourcentage;

    private DiscountTarget cible;
    private String boutiqueId;
    private String boutiqueNom;
    private String utilisateurId;
    private String utilisateurEmail;

    private Double montantMinCommande;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private Integer usageMax;
    private Integer usageMaxParUtilisateur;
    private Integer usageCount;

    private Boolean estActif;

    // Statistiques affichées
    private Double totalReduction;
    private LocalDateTime dateCreation;
}
