package com.lifeevent.lid.wishlist.controller;

import com.lifeevent.lid.wishlist.dto.WishlistDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Interface documentant les endpoints Wishlist pour Swagger.
 * CUSTOMER: accès à sa propre wishlist uniquement (#customerId == authentication.name)
 * ADMIN/SUPER_ADMIN: accès à toutes les wishlists (support backoffice/dev).
 */
@Tag(name = "Wishlist", description = "API pour la gestion de la liste de favoris (produits)")
@SecurityRequirement(name = "Bearer Token")
public interface IWishlistController {

    @Operation(
            summary = "Récupérer la wishlist",
            description = "Retourne la liste complète des produits en favoris du client (CUSTOMER ou ADMIN/SUPER_ADMIN)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des produits en wishlist"),
            @ApiResponse(responseCode = "401", description = "Non autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @GetMapping
    @PreAuthorize("(hasRole('CUSTOMER') and #customerId == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")
    ResponseEntity<List<WishlistDto>> getWishlist(
            @Parameter(description = "ID du client (userId)", required = true)
            @RequestParam String customerId
    );

    @Operation(
            summary = "Ajouter à la wishlist",
            description = "Ajoute un produit à la liste de favoris du client (CUSTOMER ou ADMIN/SUPER_ADMIN)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Produit ajouté à la wishlist"),
            @ApiResponse(responseCode = "404", description = "Produit non trouvé"),
            @ApiResponse(responseCode = "401", description = "Non autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @PostMapping("/{productId}")
    @PreAuthorize("(hasRole('CUSTOMER') and #customerId == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")
    ResponseEntity<WishlistDto> addToWishlist(
            @Parameter(description = "ID du produit (UUID)", required = true)
            @PathVariable String productId,
            @Parameter(description = "ID du client (userId)", required = true)
            @RequestParam String customerId
    );

    @Operation(
            summary = "Retirer de la wishlist",
            description = "Supprime un produit de la liste de favoris du client (CUSTOMER ou ADMIN/SUPER_ADMIN)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Produit retiré avec succès"),
            @ApiResponse(responseCode = "401", description = "Non autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @DeleteMapping("/{productId}")
    @PreAuthorize("(hasRole('CUSTOMER') and #customerId == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")
    ResponseEntity<Void> removeFromWishlist(
            @Parameter(description = "ID du produit (UUID)", required = true)
            @PathVariable String productId,
            @Parameter(description = "ID du client (userId)", required = true)
            @RequestParam String customerId
    );

    @Operation(
            summary = "Vérifier si en wishlist",
            description = "Retourne true si le produit est dans la liste de favoris (CUSTOMER ou ADMIN/SUPER_ADMIN)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "État de présence en wishlist (true/false)"),
            @ApiResponse(responseCode = "401", description = "Non autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @GetMapping("/{productId}/exists")
    @PreAuthorize("(hasRole('CUSTOMER') and #customerId == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")
    ResponseEntity<Boolean> isInWishlist(
            @Parameter(description = "ID du produit (UUID)", required = true)
            @PathVariable String productId,
            @Parameter(description = "ID du client (userId)", required = true)
            @RequestParam String customerId
    );
}

