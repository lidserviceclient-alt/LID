package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.AuthCustomerResponse;
import com.lifeevent.lid.auth.dto.AuthPartnerResponse;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;

/**
 * Interface documentant les endpoints d'authentification pour Swagger
 */
@Tag(name = "Authentification", description = "API pour la gestion de l'authentification et du refresh token")
public interface IAuthController {

    /**
     * Authentification client via Google OAuth2 (alias explicite)
     */
    @PostMapping("/login/customer")
    @Operation(
            summary = "Connexion client (alias)",
            description = "Alias explicite du login client Google OAuth2"
    )
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "401", description = "Token Google invalide"),
            @ApiResponse(responseCode = "400", description = "Token manquant")
    })
    AuthCustomerResponse loginCustomerWithGoogle(
            @Parameter(
                    description = "Requête HTTP contenant le header Authorization avec le token Google",
                    required = true
            )
            HttpServletRequest request,

            @Parameter(
                    description = "Réponse HTTP pour définir le cookie refresh_token",
                    required = true
            )
            HttpServletResponse response
    );

    /**
     * Authentification partner via Google OAuth2
     */
    @PostMapping("/login/partner")
    @Operation(
            summary = "Connexion partner avec Google OAuth2",
            description = "Authentifie le partner avec un token Google OAuth2"
    )
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "401", description = "Token Google invalide"),
            @ApiResponse(responseCode = "400", description = "Token manquant")
    })
    AuthPartnerResponse loginPartnerWithGoogle(
            @Parameter(
                    description = "Requête HTTP contenant le header Authorization avec le token Google",
                    required = true
            )
            HttpServletRequest request,

            @Parameter(
                    description = "Réponse HTTP pour définir le cookie refresh_token",
                    required = true
            )
            HttpServletResponse response
    );
    
    /**
     * Rafraîchissement du access token
     * 
     * Utilise le refresh token stocké en cookie pour générer un nouveau access token.
     * Valide que le refresh token n'a pas été révoqué et n'a pas expiré.
     */
    @PostMapping("/refresh")
    @Operation(
        summary = "Rafraîchir le access token",
        description = "Utilise le refresh token en cookie pour générer un nouveau access token JWT"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Nouveau access token généré avec succès",
            content = @Content(schema = @Schema(implementation = RefreshResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Refresh token invalide, expiré ou révoqué"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Refresh token manquant dans les cookies"
        )
    })
    RefreshResponse refresh(
        @Parameter(
            description = "Refresh token stocké en cookie",
            required = true
        )
        @CookieValue(name = "refresh_token")
        String refreshTokenId
    );
    
    /**
     * Déconnexion et révocation du refresh token
     * 
     * Révoque le refresh token et supprime le cookie de session.
     * Après cet appel, le refresh token ne pourra plus être utilisé.
     */
    @PostMapping("/logout")
    @Operation(
        summary = "Déconnexion",
        description = "Révoque le refresh token et supprime la session utilisateur"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Déconnexion réussie - Refresh token révoqué, cookie supprimé"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Refresh token manquant (optionnel pour le logout)"
        )
    })
    void logout(
        @Parameter(
            description = "Refresh token stocké en cookie (optionnel)",
            required = false
        )
        @CookieValue(name = "refresh_token", required = false)
        String refreshTokenId,
        
        @Parameter(
            description = "Réponse HTTP pour supprimer le cookie refresh_token",
            required = true
        )
        HttpServletResponse response
    );
}
