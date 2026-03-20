package com.lifeevent.lid.user.partner.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour l'ÉTAPE 2 d'enregistrement Partner
 * Infos de la boutique
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegisterStep2RequestDto {
    
    @Schema(description = "Nom de la boutique", example = "Electronics Paradise")
    private String shopName;
    
    @Schema(description = "ID de la catégorie principale", example = "1")
    private Integer mainCategoryId;
    
    @Schema(description = "Description de la boutique", example = "Vente d'électronique haute gamme")
    private String shopDescription;

    @Schema(description = "Description courte", example = "Boutique tech premium")
    private String description;

    @Schema(description = "Adresse du siège social", example = "123 Rue de Commerce, Dakar")
    private String headOfficeAddress;

    @Schema(description = "Ville", example = "Dakar")
    private String city;

    @Schema(description = "Pays", example = "Sénégal")
    private String country;

    @Schema(description = "Numéro NINEA", example = "123456789")
    private String ninea;

    @Schema(description = "Numéro RCCM", example = "SN-DKR-2026-A-0001")
    private String rccm;
}
