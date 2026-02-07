package com.lifeevent.lid.backoffice.category.controller;

import com.lifeevent.lid.backoffice.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryCreateRequest;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryDeleteRequest;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryResult;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Catégories", description = "API back-office pour gérer les catégories")
public interface IBackOfficeCategoryController {

    @GetMapping
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les catégories")
    @ApiResponse(responseCode = "200", description = "Liste des catégories")
    ResponseEntity<List<BackOfficeCategoryDto>> getAll();

    @PostMapping
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer une catégorie")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Catégorie créée",
                    content = @Content(schema = @Schema(implementation = BackOfficeCategoryDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeCategoryDto> create(@RequestBody BackOfficeCategoryDto dto);

    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour une catégorie")
    ResponseEntity<BackOfficeCategoryDto> update(
            @Parameter(description = "ID de la catégorie", required = true)
            @PathVariable Integer id,
            @RequestBody BackOfficeCategoryDto dto
    );

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une catégorie")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID de la catégorie", required = true)
            @PathVariable Integer id
    );

    @PostMapping("/bulk")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer des catégories en masse")
    ResponseEntity<BulkCategoryResult> bulkCreate(@RequestBody BulkCategoryCreateRequest request);

    @PostMapping("/bulk-delete")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer des catégories en masse")
    ResponseEntity<Void> bulkDelete(@RequestBody BulkCategoryDeleteRequest request);

    @PostMapping("/purge")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Purger les catégories")
    ResponseEntity<Void> purge(@RequestParam(value = "withProducts", required = false, defaultValue = "false") boolean withProducts);

    @PostMapping("/upload-image")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Uploader une image de catégorie")
    ResponseEntity<Object> uploadImage(@RequestParam("file") MultipartFile file);

    @GetMapping("/image/{filename}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer une image de catégorie")
    ResponseEntity<org.springframework.core.io.Resource> getImage(@PathVariable String filename);
}
