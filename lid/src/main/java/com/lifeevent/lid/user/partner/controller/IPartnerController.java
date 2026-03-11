package com.lifeevent.lid.user.partner.controller;

import com.lifeevent.lid.user.partner.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Interface documentant les endpoints Partner pour Swagger
 * Registration en 3 étapes (step-1 public, step-2/3 protected)
 * Partner can access only own profile (#partnerId == authentication.name or ADMIN)
 */
@Tag(name = "Partners", description = "API pour l'enregistrement et la gestion des partenaires/vendeurs")
public interface IPartnerController {
    
    /**
     * ÉTAPE 1 : Créer un Partner avec infos de compte
     * ENDPOINT PUBLIC (pas d'authentification requise)
     */
    @PostMapping("/register/step-1")
    @Operation(
        summary = "Étape 1 - Créer un compte Partner",
        description = "Crée un nouveau compte Partner avec infos de base (nom, email, téléphone) - PUBLIC"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Partner créé avec succès",
            content = @Content(schema = @Schema(implementation = PartnerRegisterStep1ResponseDto.class))
        ),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Email déjà existant")
    })
    ResponseEntity<PartnerRegisterStep1ResponseDto> registerStep1(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Infos de compte Partner",
            required = true,
            content = @Content(schema = @Schema(implementation = PartnerRegisterStep1RequestDto.class))
        )
        @RequestBody PartnerRegisterStep1RequestDto dto
    );

    @PostMapping("/register/upgrade")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Upgrade customer vers partner")
    ResponseEntity<PartnerResponseDto> upgradeToPartner(@RequestBody PartnerRegisterStep1RequestDto dto);
    
    /**
     * ÉTAPE 2 : Ajouter les infos de boutique
     * ENDPOINT PROTÉGÉ (Partner or ADMIN)
     */
    @PostMapping("/register/step-2")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(
        summary = "Étape 2 - Infos business/légales (texte)",
        description = "Enregistre les infos boutique + siège social/NINEA/RCCM (Own profile or ADMIN)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Boutique créée avec succès",
            content = @Content(schema = @Schema(implementation = PartnerResponseDto.class))
        ),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Partner or Admin only"),
        @ApiResponse(responseCode = "404", description = "Partner ou Category non trouvé"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<PartnerResponseDto> registerStep2(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Infos de boutique",
            required = true,
            content = @Content(schema = @Schema(implementation = PartnerRegisterStep2RequestDto.class))
        )
        @RequestBody PartnerRegisterStep2RequestDto dto
    );

    /**
     * ÉTAPE 3 : Ajouter les infos légales
     * ENDPOINT PROTÉGÉ (Partner or ADMIN)
     */
    @PostMapping("/register/step-3")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(
        summary = "Étape 3 - URLs médias/documents",
        description = "Enregistre les URLs uploadées (logo, bannière, document commercial) (Own profile or ADMIN)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Infos légales ajoutées avec succès",
            content = @Content(schema = @Schema(implementation = PartnerResponseDto.class))
        ),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Partner or Admin only"),
        @ApiResponse(responseCode = "404", description = "Partner non trouvé"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<PartnerResponseDto> registerStep3(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Infos légales",
            required = true,
            content = @Content(schema = @Schema(implementation = PartnerRegisterStep3RequestDto.class))
        )
        @RequestBody PartnerRegisterStep3RequestDto dto
    );

    @PostMapping("/register/step-4")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Étape 4 - Contrat + pièces finales")
    ResponseEntity<PartnerResponseDto> registerStep4(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Contrat + pièces finales",
                    required = true,
                    content = @Content(schema = @Schema(implementation = PartnerRegisterStep4RequestDto.class))
            )
            @RequestBody PartnerRegisterStep4RequestDto dto
    );

    @GetMapping("/register/aggregate")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Agrégat des étapes d'inscription partner")
    ResponseEntity<PartnerRegistrationAggregateDto> getRegistrationAggregate();

    /**
     * Récupérer un Partner par ID
     * ENDPOINT PROTÉGÉ (Own profile or ADMIN)
     */
    @GetMapping("/{partnerId}")
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(
        summary = "Récupérer un Partner",
        description = "Récupère les détails complets d'un Partner avec ses infos de boutique et légales (Own profile or ADMIN)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Partner trouvé",
            content = @Content(schema = @Schema(implementation = PartnerResponseDto.class))
        ),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Can view only own profile"),
        @ApiResponse(responseCode = "404", description = "Partner non trouvé")
    })
    ResponseEntity<PartnerResponseDto> getPartner(
        @Parameter(description = "ID du Partner", required = true)
        @PathVariable String partnerId
    );
    
    /**
     * Mettre à jour un Partner
     * ENDPOINT PROTÉGÉ (Own profile or ADMIN)
     */
    @PutMapping("/{partnerId}")
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(
        summary = "Mettre à jour un Partner",
        description = "Met à jour les infos générales d'un Partner (nom, prénom, téléphone) (Own profile or ADMIN)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Partner mis à jour avec succès",
            content = @Content(schema = @Schema(implementation = PartnerResponseDto.class))
        ),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Can update only own profile"),
        @ApiResponse(responseCode = "404", description = "Partner non trouvé"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<PartnerResponseDto> updatePartner(
        @Parameter(description = "ID du Partner", required = true)
        @PathVariable String partnerId,
        @RequestBody PartnerResponseDto dto
    );
    
    /**
     * Supprimer un Partner
     * ENDPOINT PROTÉGÉ (ADMIN only)
     */
    @DeleteMapping("/{partnerId}")
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(
        summary = "Supprimer un Partner",
        description = "Supprime complètement un Partner et ses données associées (ADMIN only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Partner supprimé avec succès"),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin only"),
        @ApiResponse(responseCode = "404", description = "Partner non trouvé")
    })
    ResponseEntity<Void> deletePartner(
        @Parameter(description = "ID du Partner", required = true)
        @PathVariable String partnerId
    );
}
