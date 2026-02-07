package com.lifeevent.lid.backoffice.stock.controller;

import com.lifeevent.lid.backoffice.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Stocks", description = "API back-office pour gérer les mouvements de stock")
public interface IBackOfficeStockController {

    @GetMapping("/movements")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les mouvements de stock")
    @ApiResponse(responseCode = "200", description = "Liste paginée des mouvements")
    ResponseEntity<Page<BackOfficeStockMovementDto>> getMovements(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filtre SKU") @RequestParam(required = false) String sku,
            @Parameter(description = "Type de mouvement") @RequestParam(required = false) StockMovementType type
    );

    @PostMapping("/movements")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un mouvement de stock")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Mouvement créé",
                    content = @Content(schema = @Schema(implementation = BackOfficeStockMovementDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeStockMovementDto> createMovement(@RequestBody CreateStockMovementRequest request);
}
