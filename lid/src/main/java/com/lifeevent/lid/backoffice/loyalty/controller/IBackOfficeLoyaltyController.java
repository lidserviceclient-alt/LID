package com.lifeevent.lid.backoffice.loyalty.controller;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Loyalty", description = "API back-office pour la fidélité")
public interface IBackOfficeLoyaltyController {

    @GetMapping("/overview")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Vue d'ensemble fidélité")
    ResponseEntity<BackOfficeLoyaltyOverviewDto> getOverview();

    @GetMapping("/tiers")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les niveaux de fidélité")
    ResponseEntity<List<BackOfficeLoyaltyTierDto>> getTiers();

    @GetMapping("/config")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer la configuration fidélité")
    ResponseEntity<BackOfficeLoyaltyConfigDto> getConfig();

    @PutMapping("/config")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour la configuration fidélité")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Configuration mise à jour",
                    content = @Content(schema = @Schema(implementation = BackOfficeLoyaltyConfigDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeLoyaltyConfigDto> updateConfig(@RequestBody BackOfficeLoyaltyConfigDto dto);

    @PutMapping("/tiers/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un niveau de fidélité")
    ResponseEntity<BackOfficeLoyaltyTierDto> updateTier(
            @Parameter(description = "ID du niveau", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficeLoyaltyTierDto dto
    );
}
