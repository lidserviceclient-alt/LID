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
    
    @Schema(description = "ID du Partner", example = "google-12345")
    private String partnerId;
    
    @Schema(description = "Nom de la boutique", example = "Electronics Paradise")
    private String shopName;
    
    @Schema(description = "ID de la catégorie principale", example = "1")
    private Integer mainCategoryId;
    
    @Schema(description = "Description de la boutique", example = "Vente d'électronique haute gamme")
    private String shopDescription;
}
