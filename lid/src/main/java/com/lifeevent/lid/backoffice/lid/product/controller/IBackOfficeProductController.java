package com.lifeevent.lid.backoffice.lid.product.controller;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductCreateRequest;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductDeleteRequest;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductDeleteResponse;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductResult;
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
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Produits", description = "API back-office pour gérer les produits")
public interface IBackOfficeProductController {

    @GetMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les produits")
    @ApiResponse(responseCode = "200", description = "Liste paginée des produits")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeProductDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size
    );

    @PostMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Créer un produit")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Produit créé",
                    content = @Content(schema = @Schema(implementation = BackOfficeProductDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeProductDto> create(@RequestBody BackOfficeProductDto dto);

    @GetMapping("/{id}")
    ResponseEntity<BackOfficeProductDto> getById(
            @Parameter(description = "ID du produit", required = true)
            @PathVariable Long id
    );

    @PutMapping("/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour un produit")
    ResponseEntity<BackOfficeProductDto> update(
            @Parameter(description = "ID du produit", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficeProductDto dto
    );

    @DeleteMapping("/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Supprimer un produit")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID du produit", required = true)
            @PathVariable Long id
    );

    @PostMapping("/bulk")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Créer des produits en masse")
    ResponseEntity<BulkProductResult> bulkCreate(@RequestBody BulkProductCreateRequest request);

    @PostMapping("/bulk-delete")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Supprimer des produits en masse")
    ResponseEntity<BulkProductDeleteResponse> bulkDelete(@RequestBody BulkProductDeleteRequest request);
}
