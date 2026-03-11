package com.lifeevent.lid.user.partner.dto;

import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour la réponse complète d'un Partner
 * Contient toutes les infos après enregistrement complet
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponseDto {
    
    @Schema(description = "ID du Partner (userId depuis Google/OAuth2)", example = "google-12345")
    private String userId;
    
    @Schema(description = "Prénom", example = "Jean")
    private String firstName;
    
    @Schema(description = "Nom", example = "Dupont")
    private String lastName;
    
    @Schema(description = "Email", example = "jean@example.com")
    private String email;
    
    @Schema(description = "Numéro de téléphone", example = "+33612345678")
    private String phoneNumber;
    
    @Schema(description = "Informations de la boutique")
    private ShopDto shop;
    
    @Schema(description = "Adresse du siège social", example = "123 Rue de Commerce, 75000")
    private String headOfficeAddress;
    
    @Schema(description = "Ville", example = "Paris")
    private String city;
    
    @Schema(description = "Pays", example = "France")
    private String country;

    @Schema(description = "Numéro NINEA", example = "123456789")
    private String ninea;

    @Schema(description = "Numéro RCCM", example = "SN-DKR-2026-A-0001")
    private String rccm;
    
    @Schema(description = "URL du document d'enregistrement commercial", example = "https://documents.example.com/registration.pdf")
    private String businessRegistrationDocumentUrl;

    @Schema(description = "Contrat accepté", example = "true")
    private Boolean contractAccepted;

    @Schema(description = "URL document d'identité", example = "https://documents.example.com/id.pdf")
    private String idDocumentUrl;

    @Schema(description = "URL document NINEA", example = "https://documents.example.com/ninea.pdf")
    private String nineaDocumentUrl;

    @Schema(description = "URL ZIP des pièces complémentaires", example = "https://documents.example.com/supporting.zip")
    private String supportingDocumentsZipUrl;
    
    @Schema(description = "Statut d'enregistrement", example = "STEP_1_PENDING")
    private PartnerRegistrationStatus registrationStatus;
}
