package com.lifeevent.lid.user.partner.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour l'ÉTAPE 3 d'enregistrement Partner
 * URLs des médias/documents uploadés via storage direct
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegisterStep3RequestDto {
    
    @Schema(description = "URL logo boutique", example = "https://cdn.example.com/partners/p-1/logo.png")
    private String logoUrl;

    @Schema(description = "URL bannière boutique", example = "https://cdn.example.com/partners/p-1/banner.png")
    private String bannerUrl;
    
    @Schema(description = "URL du document d'enregistrement commercial", example = "https://cdn.example.com/partners/p-1/rccm.pdf")
    private String businessRegistrationDocumentUrl;
}
