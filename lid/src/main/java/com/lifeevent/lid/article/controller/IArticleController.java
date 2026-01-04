package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface documentant les endpoints Article pour Swagger
 */
@Tag(name = "Articles", description = "API pour gérer les articles de la plateforme e-commerce")
public interface IArticleController {

    @PostMapping
    @Operation(summary = "Créer un nouvel article", description = "Crée un nouvel article dans la plateforme")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Article créé avec succès",
                    content = @Content(schema = @Schema(implementation = ArticleDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "409", description = "Article déjà existant")
    })
    ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleDto dto);

    // =========================
    // IMPORT CSV (FIX SWAGGER)
    // =========================
    @PostMapping(
            value = "/import",
            consumes = "multipart/form-data"
    )
    @Operation(summary = "Importer des articles via CSV",
            description = "Importe plusieurs articles à partir d'un fichier CSV")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Import démarré avec succès"),
            @ApiResponse(responseCode = "400", description = "Fichier invalide"),
            @ApiResponse(responseCode = "500", description = "Erreur lors du traitement")
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
            description = "Récupère la liste complète de tous les articles")
    @ApiResponse(
            responseCode = "200",
            description = "Liste des articles",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> getAllArticles();

    @GetMapping("/search/name")
    @Operation(summary = "Rechercher des articles par nom",
            description = "Effectue une recherche des articles par nom")
    @ApiResponse(
            responseCode = "200",
            description = "Résultats de la recherche",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> searchByName(
            @Parameter(description = "Nom de l'article à rechercher", required = true)
            @RequestParam String name
    );

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Récupérer les articles d'une catégorie",
            description = "Récupère tous les articles d'une catégorie spécifique")
    @ApiResponse(
            responseCode = "200",
            description = "Articles de la catégorie",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> getByCategory(
            @Parameter(description = "ID de la catégorie", required = true)
            @PathVariable Integer categoryId
    );

    @GetMapping("/search/price")
    @Operation(summary = "Rechercher des articles par prix",
            description = "Effectue une recherche des articles dans une plage de prix")
    @ApiResponse(
            responseCode = "200",
            description = "Articles correspondant au critère de prix",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> getByPriceRange(
            @Parameter(description = "Prix minimum", required = true)
            @RequestParam Integer minPrice,
            @Parameter(description = "Prix maximum", required = true)
            @RequestParam Integer maxPrice
    );

    @GetMapping("/search/name-category")
    @Operation(summary = "Rechercher par nom et catégorie",
            description = "Effectue une recherche des articles par nom et catégorie")
    @ApiResponse(
            responseCode = "200",
            description = "Articles correspondant aux critères",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> searchByNameAndCategory(
            @Parameter(description = "Nom de l'article", required = true)
            @RequestParam String name,
            @Parameter(description = "ID de la catégorie", required = true)
            @RequestParam Integer categoryId
    );

    @GetMapping("/search/name-price")
    @Operation(summary = "Rechercher par nom et prix",
            description = "Effectue une recherche des articles par nom et plage de prix")
    @ApiResponse(
            responseCode = "200",
            description = "Articles correspondant aux critères",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> searchByNameAndPrice(
            @RequestParam String name,
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice
    );

    @GetMapping("/search/advanced")
    @Operation(summary = "Recherche avancée d'articles",
            description = "Effectue une recherche avancée avec filtres optionnels")
    @ApiResponse(
            responseCode = "200",
            description = "Articles correspondant aux critères",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(type = "array", implementation = ArticleDto.class)
            )
    )
    ResponseEntity<List<ArticleDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice
    );

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un article",
            description = "Met à jour les informations d'un article existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article mis à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Article non trouvé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<ArticleDto> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleDto dto
    );

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un article",
            description = "Supprime un article de la plateforme")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Article supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Article non trouvé")
    })
    ResponseEntity<Void> deleteArticle(@PathVariable Long id);

    @PostMapping("/{articleId}/categories/{categoryId}")
    @Operation(summary = "Ajouter une catégorie à un article",
            description = "Associe une catégorie à un article existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Catégorie ajoutée avec succès"),
            @ApiResponse(responseCode = "404", description = "Article ou catégorie non trouvé"),
            @ApiResponse(responseCode = "409", description = "Catégorie déjà associée")
    })
    ResponseEntity<Void> addCategoryToArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId
    );

    @DeleteMapping("/{articleId}/categories/{categoryId}")
    @Operation(summary = "Retirer une catégorie d'un article",
            description = "Dissocie une catégorie d'un article")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Catégorie retirée avec succès"),
            @ApiResponse(responseCode = "404", description = "Article ou catégorie non trouvé")
    })
    ResponseEntity<Void> removeCategoryFromArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId
    );
}
