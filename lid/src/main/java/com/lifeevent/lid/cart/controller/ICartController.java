package com.lifeevent.lid.cart.controller;

import com.lifeevent.lid.cart.dto.CartDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Interface documentant les endpoints Cart pour Swagger
 */
@Tag(name = "Paniers", description = "API pour gérer les paniers d'achat (carts)")
public interface ICartController {
    
//    @PostMapping("/customer/{customerId}")
//    @Operation(summary = "Créer un panier pour un client", description = "Crée un nouveau panier d'achat pour un client")
//    @ApiResponses(value = {
//        @ApiResponse(responseCode = "201", description = "Panier créé avec succès",
//            content = @Content(schema = @Schema(implementation = CartDto.class))),
//        @ApiResponse(responseCode = "404", description = "Client non trouvé")
//    })
//    ResponseEntity<CartDto> createCart(
//            @Parameter(description = "ID du client", required = true) @PathVariable Integer customerId);
//
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Récupérer le panier d'un client", description = "Récupère le panier d'achat d'un client avec tous ses articles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Panier trouvé",
            content = @Content(schema = @Schema(implementation = CartDto.class))),
        @ApiResponse(responseCode = "404", description = "Panier non trouvé")
    })
    ResponseEntity<CartDto> getCart(
            @Parameter(description = "ID du client", required = true) @PathVariable Integer customerId);
    
    @PostMapping("/{customerId}/articles/{articleId}")
    @Operation(summary = "Ajouter un article au panier", description = "Ajoute un article au panier d'un client (ou augmente la quantité si l'article est déjà présent)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article ajouté avec succès",
            content = @Content(schema = @Schema(implementation = CartDto.class))),
        @ApiResponse(responseCode = "404", description = "Client ou article non trouvé")
    })
    ResponseEntity<CartDto> addArticle(
            @Parameter(description = "ID du client", required = true) @PathVariable Integer customerId,
            @Parameter(description = "ID de l'article à ajouter", required = true) @PathVariable Long articleId);
    
    @DeleteMapping("/{customerId}/articles/{articleId}")
    @Operation(summary = "Retirer un article du panier", description = "Supprime complètement un article du panier d'un client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article retiré avec succès",
            content = @Content(schema = @Schema(implementation = CartDto.class))),
        @ApiResponse(responseCode = "404", description = "Client, panier ou article non trouvé")
    })
    ResponseEntity<CartDto> removeArticle(
            @Parameter(description = "ID du client", required = true) @PathVariable Integer customerId,
            @Parameter(description = "ID de l'article à retirer", required = true) @PathVariable Long articleId);
    
    @DeleteMapping("/customer/{customerId}/clear")
    @Operation(summary = "Vider le panier", description = "Supprime tous les articles du panier d'un client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Panier vidé avec succès"),
        @ApiResponse(responseCode = "404", description = "Client ou panier non trouvé")
    })
    ResponseEntity<Void> clearCart(
            @Parameter(description = "ID du client", required = true) @PathVariable Integer customerId);
    
    @DeleteMapping("/{cartId}")
    @Operation(summary = "Supprimer un panier", description = "Supprime complètement un panier et tous ses articles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Panier supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Panier non trouvé")
    })
    ResponseEntity<Void> deleteCart(
            @Parameter(description = "ID du panier", required = true) @PathVariable Integer cartId);
}
