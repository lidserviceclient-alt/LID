package com.lifeevent.lid.user.partner.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegisterStep4RequestDto {

    @Schema(description = "Contrat accepté", example = "true")
    private Boolean contractAccepted;

    @Schema(description = "URL document d'identité", example = "https://cdn.example.com/id.pdf")
    private String idDocumentUrl;

    @Schema(description = "URL document NINEA", example = "https://cdn.example.com/ninea.pdf")
    private String nineaDocumentUrl;

    @Schema(description = "URL ZIP des pièces complémentaires", example = "https://cdn.example.com/supporting-docs.zip")
    private String supportingDocumentsZipUrl;
}
