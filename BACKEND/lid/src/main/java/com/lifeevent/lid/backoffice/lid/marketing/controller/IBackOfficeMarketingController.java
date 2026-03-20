package com.lifeevent.lid.backoffice.lid.marketing.controller;

import com.lifeevent.lid.backoffice.lid.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.backoffice.lid.marketing.dto.MarketingOverviewDto;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Marketing", description = "API back-office pour le marketing")
public interface IBackOfficeMarketingController {

    @GetMapping("/overview")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Vue d'ensemble marketing")
    ResponseEntity<MarketingOverviewDto> getOverview(
            @Parameter(description = "Nombre de jours") @RequestParam(required = false) Integer days
    );

    @GetMapping("/campaigns")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les campagnes")
    @ApiResponse(responseCode = "200", description = "Liste paginée des campagnes")
    ResponseEntity<Page<BackOfficeMarketingCampaignDto>> getCampaigns(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Statut") @RequestParam(required = false) MarketingCampaignStatus status
    );

    @PostMapping("/campaigns")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Créer une campagne")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Campagne créée",
                    content = @Content(schema = @Schema(implementation = BackOfficeMarketingCampaignDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeMarketingCampaignDto> createCampaign(@Valid @RequestBody BackOfficeMarketingCampaignDto dto);

    @PutMapping("/campaigns/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour une campagne")
    ResponseEntity<BackOfficeMarketingCampaignDto> updateCampaign(
            @Parameter(description = "ID de la campagne", required = true)
            @PathVariable Long id,
            @Valid @RequestBody BackOfficeMarketingCampaignDto dto
    );

    @PostMapping("/campaigns/{id}/send")
    ResponseEntity<BackOfficeMarketingCampaignDto> sendCampaign(
            @Parameter(description = "ID de la campagne", required = true)
            @PathVariable Long id
    );

    @DeleteMapping("/campaigns/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Supprimer une campagne")
    ResponseEntity<Void> deleteCampaign(
            @Parameter(description = "ID de la campagne", required = true)
            @PathVariable Long id
    );
}
