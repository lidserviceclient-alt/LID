package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.CategoryDto;
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

import java.util.List;

/**
 * Interface documentant les endpoints Category pour Swagger
 * Les GET sont publics (lecture du catalogue - USER, CUSTOMER, PARTNER, ADMIN)
 * Les POST/PUT/DELETE sont protégés (ADMIN only)
 */
@Tag(name = "Catégories", description = "API pour gérer les catégories de produits")
public interface ICategoryController {
    
    /**
     * Créer une catégorie (ADMIN ONLY)
     */
    @PostMapping
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Créer une catégorie", description = "Crée une nouvelle catégorie de produits (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Catégorie créée avec succès",
            content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin required")
    })
    ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto dto);
    
    /**
     * Récupérer une catégorie par ID (PUBLIC - lecture)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une catégorie", description = "Récupère les détails d'une catégorie spécifique (PUBLIC)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catégorie trouvée",
            content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée")
    })
    ResponseEntity<CategoryDto> getCategory(
        @Parameter(description = "ID de la catégorie", required = true)
        @PathVariable Integer id
    );
    
    /**
     * Lister toutes les catégories (PUBLIC - lecture)
     */
    @GetMapping
    @Operation(summary = "Lister toutes les catégories", description = "Récupère la liste complète des catégories (PUBLIC)")
    @ApiResponse(responseCode = "200", description = "Liste des catégories")
    ResponseEntity<List<CategoryDto>> getAllCategories();
    
    /**
     * Rechercher par nom (PUBLIC - lecture)
     */
    @GetMapping("/name/{name}")
    @Operation(summary = "Rechercher une catégorie par nom", description = "Récupère une catégorie par son nom (PUBLIC)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catégorie trouvée"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée")
    })
    ResponseEntity<CategoryDto> getCategoryByName(
        @Parameter(description = "Nom de la catégorie", required = true)
        @PathVariable String name
    );
    
    /**
     * Mettre à jour une catégorie (ADMIN ONLY)
     */
    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Mettre à jour une catégorie", description = "Modifie les informations d'une catégorie existante (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catégorie mise à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin required")
    })
    ResponseEntity<CategoryDto> updateCategory(
        @Parameter(description = "ID de la catégorie", required = true)
        @PathVariable Integer id,
        @RequestBody CategoryDto dto
    );
    
    /**
     * Supprimer une catégorie (ADMIN ONLY)
     */
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Supprimer une catégorie", description = "Supprime complètement une catégorie (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Catégorie supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin required")
    })
    ResponseEntity<Void> deleteCategory(
        @Parameter(description = "ID de la catégorie", required = true)
        @PathVariable Integer id
    );
}
