package com.lifeevent.lid.user.partner.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO pour les informations de Shop (Boutique)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDto {
    
    @Schema(description = "ID de la boutique", example = "1")
    private Long shopId;
    
    @Schema(description = "Nom de la boutique", example = "Electronics Paradise")
    private String shopName;
    
    @Schema(description = "ID de la catégorie principale", example = "1")
    private Integer mainCategoryId;
    
    @Schema(description = "Description de la boutique", example = "Vente d'électronique haute gamme")
    private String shopDescription;
}
