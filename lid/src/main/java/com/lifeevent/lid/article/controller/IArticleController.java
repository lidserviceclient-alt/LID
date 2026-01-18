package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleDto;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface documentant les endpoints Article pour Swagger
 * Les GET sont publics (lecture du catalogue)
 * Les POST/PUT/DELETE sont protégés (gestion admin/vendeur)
 */
@Tag(name = "Articles", description = "API pour gérer les articles de la plateforme e-commerce")
public interface IArticleController {

    @PostMapping
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Créer un nouvel article", description = "Crée un nouvel article dans la plateforme")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Article créé avec succès",
                    content = @Content(schema = @Schema(implementation = ArticleDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "409", description = "Article déjà existant"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleDto dto);


    @PostMapping(
            value = "/import",
            consumes = "multipart/form-data"
    )
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Importer des articles via CSV",
            description = "Importe plusieurs articles à partir d'un fichier CSV")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Import démarré avec succès"),
            @ApiResponse(responseCode = "400", description = "Fichier invalide"),
            @ApiResponse(responseCode = "500", description = "Erreur lors du traitement"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<String> importArticles(
            @Parameter(
                    description = "Fichier CSV à importer",
                    required = true,
                    content = @Content(
                            mediaType = "multipart/form-data",
                            schema = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestParam("file") MultipartFile file
    );

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un article par ID",
            description = "Récupère les détails d'un article spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article trouvé",
                    content = @Content(schema = @Schema(implementation = ArticleDto.class))),
            @ApiResponse(responseCode = "404", description = "Article non trouvé")
    })
    ResponseEntity<ArticleDto> getArticle(
            @Parameter(description = "ID de l'article", required = true)
            @PathVariable Long id
    );

    @GetMapping
    @Operation(summary = "Lister tous les articles",
            description = "Récupère la liste paginée de tous les articles")
    @ApiResponse(
            responseCode = "200",
            description = "Liste paginée des articles"
    )
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> getAllArticles(
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search/name")
    @Operation(summary = "Rechercher des articles par nom",
            description = "Effectue une recherche paginée des articles par nom")
    @ApiResponse(responseCode = "200", description = "Résultats de la recherche paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> searchByName(
            @Parameter(description = "Nom de l'article à rechercher", required = true)
            @RequestParam String name,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Récupérer les articles d'une catégorie",
            description = "Récupère les articles paginés d'une catégorie spécifique")
    @ApiResponse(responseCode = "200", description = "Articles de la catégorie paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> getByCategory(
            @Parameter(description = "ID de la catégorie", required = true)
            @PathVariable Integer categoryId,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search/price")
    @Operation(summary = "Rechercher des articles par prix",
            description = "Effectue une recherche paginée des articles dans une plage de prix")
    @ApiResponse(responseCode = "200", description = "Articles correspondant au critère paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> getByPriceRange(
            @Parameter(description = "Prix minimum", required = true)
            @RequestParam Double minPrice,
            @Parameter(description = "Prix maximum", required = true)
            @RequestParam Double maxPrice,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search/name-category")
    @Operation(summary = "Rechercher par nom et catégorie",
            description = "Effectue une recherche paginée des articles par nom et catégorie")
    @ApiResponse(responseCode = "200", description = "Articles correspondant aux critères paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> searchByNameAndCategory(
            @Parameter(description = "Nom de l'article", required = true)
            @RequestParam String name,
            @Parameter(description = "ID de la catégorie", required = true)
            @RequestParam Integer categoryId,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search/name-price")
    @Operation(summary = "Rechercher par nom et prix",
            description = "Effectue une recherche paginée des articles par nom et plage de prix")
    @ApiResponse(responseCode = "200", description = "Articles correspondant aux critères paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> searchByNameAndPrice(
            @Parameter(description = "Nom de l'article", required = true)
            @RequestParam String name,
            @Parameter(description = "Prix minimum", required = true)
            @RequestParam Double minPrice,
            @Parameter(description = "Prix maximum", required = true)
            @RequestParam Double maxPrice,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search/advanced")
    @Operation(summary = "Recherche avancée d'articles",
            description = "Effectue une recherche paginée avancée avec filtres optionnels")
    @ApiResponse(responseCode = "200", description = "Articles correspondant aux critères paginés")
    ResponseEntity<org.springframework.data.domain.Page<ArticleDto>> advancedSearch(
            @Parameter(description = "Nom de l'article (optionnel)")
            @RequestParam(required = false) String name,
            @Parameter(description = "ID de la catégorie (optionnel)")
            @RequestParam(required = false) Integer categoryId,
            @Parameter(description = "Prix minimum (optionnel)")
            @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Prix maximum (optionnel)")
            @RequestParam(required = false) Double maxPrice,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Mettre à jour un article",
            description = "Met à jour les informations d'un article existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article mis à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Article non trouvé"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<ArticleDto> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleDto dto
    );

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Supprimer un article",
            description = "Supprime un article de la plateforme")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Article supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Article non trouvé"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<Void> deleteArticle(@PathVariable Long id);

    @PutMapping("/{id}/deactivate")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Désactiver un article",
            description = "Marque un article comme inactif (soft delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article désactivé avec succès"),
            @ApiResponse(responseCode = "404", description = "Article non trouvé"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<Void> deactivateArticle(@PathVariable Long id);

    @PostMapping("/{articleId}/categories/{categoryId}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Ajouter une catégorie à un article",
            description = "Associe une catégorie à un article existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Catégorie ajoutée avec succès"),
            @ApiResponse(responseCode = "404", description = "Article ou catégorie non trouvé"),
            @ApiResponse(responseCode = "409", description = "Catégorie déjà associée"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<Void> addCategoryToArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId
    );

    @DeleteMapping("/{articleId}/categories/{categoryId}")
    @SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Retirer une catégorie d'un article",
            description = "Dissocie une catégorie d'un article")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Catégorie retirée avec succès"),
            @ApiResponse(responseCode = "404", description = "Article ou catégorie non trouvé"),
            @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    ResponseEntity<Void> removeCategoryFromArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId
    );
}
