package com.lifeevent.lid.user.partner.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour l'ÉTAPE 1 d'enregistrement Partner
 * Infos compte de base
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegisterStep1RequestDto {
    
    @Schema(description = "Prénom du partenaire", example = "Jean")
    private String firstName;
    
    @Schema(description = "Nom du partenaire", example = "Dupont")
    private String lastName;
    
    @Schema(description = "Email du partenaire", example = "jean@example.com")
    private String email;
    
    @Schema(description = "Numéro de téléphone", example = "+33612345678")
    private String phoneNumber;

    @Schema(description = "Mot de passe (sera hashé côté backend)", example = "MyStrongPassword123!")
    private String password;
}
