package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.AuthResponse;
import com.lifeevent.lid.auth.dto.ForgotPasswordRequest;
import com.lifeevent.lid.auth.dto.ForgotPasswordResponse;
import com.lifeevent.lid.auth.dto.LoginRequest;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.dto.ResetPasswordRequest;
import com.lifeevent.lid.auth.dto.VerifyResetCodeRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Interface documentant les endpoints d'authentification pour Swagger
 */
@Tag(name = "Authentification", description = "API pour la gestion de l'authentification et du refresh token")
public interface IAuthController {
    
    /**
     * Authentification via Google OAuth2
     * 
     * Accepte un token Google ID JWT dans l'header Authorization et valide l'identité.
     * Retourne un access token JWT et définit un refresh token en cookie.
     */
    @PostMapping("/login")
    @Operation(
            summary = "Connexion avec Google OAuth2",
            description = "Authentifie l'utilisateur avec un token Google OAuth2"
    )
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "401", description = "Token Google invalide"),
            @ApiResponse(responseCode = "400", description = "Token manquant")
    })
    AuthResponse loginWithGoogle(
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

    @PostMapping("/password/forgot")
    @Operation(
        summary = "Demander un code de réinitialisation",
        description = "Envoie un code de réinitialisation par email si l'utilisateur existe"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Code envoyé si l'email existe"),
        @ApiResponse(responseCode = "400", description = "Email invalide")
    })
    ForgotPasswordResponse forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request
    );

    @PostMapping("/password/verify")
    @Operation(
        summary = "Vérifier un code de réinitialisation",
        description = "Valide le code et sa date d'expiration"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Code valide"),
        @ApiResponse(responseCode = "400", description = "Code invalide ou expiré")
    })
    void verifyResetCode(
        @Valid @RequestBody VerifyResetCodeRequest request
    );

    @PostMapping("/password/reset")
    @Operation(
        summary = "Réinitialiser le mot de passe",
        description = "Réinitialise le mot de passe avec le code reçu"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé"),
        @ApiResponse(responseCode = "400", description = "Code invalide ou expiré")
    })
    void resetPassword(
        @Valid @RequestBody ResetPasswordRequest request
    );

    @PostMapping("/login/local")
    @Operation(
            summary = "Connexion locale (Backoffice)",
            description = "Authentifie un utilisateur ADMIN/SUPER_ADMIN via email/mot de passe et retourne un access token JWT"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "400", description = "Identifiants invalides ou accès refusé")
    })
    AuthResponse loginLocal(
            @Valid @RequestBody LoginRequest request
    );
}
