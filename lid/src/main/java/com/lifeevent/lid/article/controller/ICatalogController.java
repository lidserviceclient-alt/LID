package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleCatalogDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Catalog", description = "API pour la gestion du catalogue de produits")
public interface ICatalogController {
    
    @Operation(summary = "Récupérer les articles en vedette", description = "Retourne une page d'articles marqués comme en vedette")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des articles en vedette",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/featured")
    ResponseEntity<Page<ArticleCatalogDto>> getFeaturedArticles(
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size);
    
    @Operation(summary = "Récupérer les meilleures ventes", description = "Retourne une page d'articles marqués comme meilleures ventes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des meilleures ventes")
    })
    @GetMapping("/bestsellers")
    ResponseEntity<Page<ArticleCatalogDto>> getBestSellers(
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size);
    
    @Operation(summary = "Récupérer les ventes flash", description = "Retourne une page d'articles en vente flash")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des articles en vente flash")
    })
    @GetMapping("/flash-sales")
    ResponseEntity<Page<ArticleCatalogDto>> getFlashSales(
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size);
    
    @Operation(summary = "Récupérer les nouveautés", description = "Retourne une page des articles récemment ajoutés")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des nouveaux articles")
    })
    @GetMapping("/new")
    ResponseEntity<Page<ArticleCatalogDto>> getNewArticles(
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size);
    
    @Operation(summary = "Recherche avancée", description = "Recherche d'articles avec filtres multiples (nom, catégorie, prix, etc.)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Résultats de la recherche"),
        @ApiResponse(responseCode = "400", description = "Paramètres invalides")
    })
    @GetMapping("/search")
    ResponseEntity<Page<ArticleCatalogDto>> search(
            @Parameter(description = "Rechercher par nom d'article", example = "Chocolat")
            @RequestParam(required = false) String name,
            @Parameter(description = "ID de la catégorie", example = "1")
            @RequestParam(required = false) Integer categoryId,
            @Parameter(description = "Prix minimum", example = "1000")
            @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Prix maximum", example = "50000")
            @RequestParam(required = false) Double maxPrice,
            @Parameter(description = "Filtrer articles en vedette", example = "true")
            @RequestParam(required = false) Boolean featured,
            @Parameter(description = "Filtrer ventes flash", example = "false")
            @RequestParam(required = false) Boolean flashSale,
            @Parameter(description = "Filtrer meilleures ventes", example = "true")
            @RequestParam(required = false) Boolean bestSeller,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'articles par page", example = "20")
            @RequestParam(defaultValue = "20") int size);
}
