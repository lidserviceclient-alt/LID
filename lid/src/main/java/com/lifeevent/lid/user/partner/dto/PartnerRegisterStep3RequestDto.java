package com.lifeevent.lid.user.partner.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour l'ÉTAPE 3 d'enregistrement Partner
 * Infos de vérification légale
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegisterStep3RequestDto {
    
    @Schema(description = "ID du Partner", example = "google-12345")
    private String partnerId;
    
    @Schema(description = "Adresse du siège social", example = "123 Rue de Commerce, 75000")
    private String headOfficeAddress;
    
    @Schema(description = "Ville", example = "Paris")
    private String city;
    
    @Schema(description = "Pays", example = "France")
    private String country;
    
    @Schema(description = "URL du document d'enregistrement commercial", example = "https://documents.example.com/registration.pdf")
    private String businessRegistrationDocumentUrl;
}
