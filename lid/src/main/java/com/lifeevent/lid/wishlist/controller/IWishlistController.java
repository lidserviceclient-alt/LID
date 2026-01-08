package com.lifeevent.lid.wishlist.controller;

import com.lifeevent.lid.wishlist.dto.WishlistDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Wishlist", description = "API pour la gestion de la liste de favoris")
@SecurityRequirement(name = "bearer-jwt")
public interface IWishlistController {
    
    @Operation(summary = "Récupérer la wishlist", description = "Retourne la liste complète des articles en favoris du client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des articles en wishlist"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @GetMapping
    ResponseEntity<List<WishlistDto>> getWishlist(
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam(defaultValue = "1") Integer customerId);
    
    @Operation(summary = "Ajouter à la wishlist", description = "Ajoute un article à la liste de favoris du client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Article ajouté à la wishlist"),
        @ApiResponse(responseCode = "404", description = "Article non trouvé"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @PostMapping("/{articleId}")
    ResponseEntity<WishlistDto> addToWishlist(
            @Parameter(description = "ID de l'article", example = "1", required = true)
            @PathVariable Long articleId,
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam(defaultValue = "1") Integer customerId);
    
    @Operation(summary = "Retirer de la wishlist", description = "Supprime un article de la liste de favoris du client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Article retiré avec succès"),
        @ApiResponse(responseCode = "404", description = "Article non trouvé en wishlist"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @DeleteMapping("/{articleId}")
    ResponseEntity<Void> removeFromWishlist(
            @Parameter(description = "ID de l'article", example = "1", required = true)
            @PathVariable Long articleId,
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam(defaultValue = "1") Integer customerId);
    
    @Operation(summary = "Vérifier si en wishlist", description = "Retourne true si l'article est dans la liste de favoris")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "État de présence en wishlist (true/false)"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @GetMapping("/{articleId}/exists")
    ResponseEntity<Boolean> isInWishlist(
            @Parameter(description = "ID de l'article", example = "1", required = true)
            @PathVariable Long articleId,
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam(defaultValue = "1") Integer customerId);
}
