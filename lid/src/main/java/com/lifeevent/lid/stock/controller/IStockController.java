package com.lifeevent.lid.stock.controller;

import com.lifeevent.lid.stock.dto.StockDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Interface documentant les endpoints Stock pour Swagger
 */
@Tag(name = "Stocks", description = "API pour gérer l'inventaire et les stocks d'articles")
public interface IStockController {
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer les informations de stock", description = "Récupère les détails du stock pour un article spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock trouvé",
            content = @Content(schema = @Schema(implementation = StockDto.class))),
        @ApiResponse(responseCode = "404", description = "Stock non trouvé")
    })
    ResponseEntity<StockDto> getStock(
            @Parameter(description = "ID du stock", required = true) @PathVariable Long id);
}
