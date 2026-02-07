package com.lifeevent.lid.backoffice.promo.controller;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.promo.dto.PromoCodeStatsDto;
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

@Tag(name = "BackOffice - Promo Codes", description = "API back-office pour gérer les codes promo")
public interface IBackOfficePromoCodeController {

    @GetMapping
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les codes promo")
    @ApiResponse(responseCode = "200", description = "Liste des codes promo")
    ResponseEntity<List<BackOfficePromoCodeDto>> getAll();

    @GetMapping("/stats")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Statistiques des codes promo")
    ResponseEntity<PromoCodeStatsDto> getStats(
            @Parameter(description = "Nombre de jours") @RequestParam(required = false) Integer days
    );

    @PostMapping
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un code promo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Code promo créé",
                    content = @Content(schema = @Schema(implementation = BackOfficePromoCodeDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficePromoCodeDto> create(@RequestBody BackOfficePromoCodeDto dto);

    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un code promo")
    ResponseEntity<BackOfficePromoCodeDto> update(
            @Parameter(description = "ID du code promo", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficePromoCodeDto dto
    );

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un code promo")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID du code promo", required = true)
            @PathVariable Long id
    );
}
