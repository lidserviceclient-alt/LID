package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.*;
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
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Authentification", description = "API pour la gestion de l'authentification et du refresh token")
public interface IAuthController {

    @PostMapping("/login")
    @Operation(summary = "Connexion Google", description = "Connexion Google avec token bearer")
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "401", description = "Token invalide"),
            @ApiResponse(responseCode = "400", description = "Token manquant")
    })
    AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response);

    @PostMapping("/login/customer")
    @Operation(summary = "Connexion client (alias)")
    @SecurityRequirement(name = "Bearer Token")
    AuthCustomerResponse loginCustomerWithGoogle(HttpServletRequest request, HttpServletResponse response);

    @PostMapping("/login/partner")
    @Operation(summary = "Connexion partner Google")
    @SecurityRequirement(name = "Bearer Token")
    AuthPartnerResponse loginPartnerWithGoogle(HttpServletRequest request, HttpServletResponse response);

    @PostMapping("/login/local")
    @Operation(summary = "Connexion locale backoffice")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "400", description = "Identifiants invalides")
    })
    AuthResponse loginLocal(@Valid @RequestBody LoginRequest request);

    @PostMapping("/login/local/verify")
    @Operation(summary = "Validation MFA admin")
    AuthResponse verifyAdminMfa(@Valid @RequestBody VerifyAdminMfaRequest request);

    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir access token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token généré", content = @Content(schema = @Schema(implementation = RefreshResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token invalide"),
            @ApiResponse(responseCode = "400", description = "Refresh token manquant")
    })
    RefreshResponse refresh(
            @Parameter(description = "Refresh token en cookie", required = true)
            @CookieValue(name = "refresh_token", required = false) String refreshTokenId
    );

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion")
    void logout(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenId,
            HttpServletResponse response
    );

    @PostMapping("/password/forgot")
    @Operation(summary = "Demander un code de réinitialisation")
    ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request);

    @PostMapping("/password/verify")
    @Operation(summary = "Vérifier un code de réinitialisation")
    void verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request);

    @PostMapping("/password/reset")
    @Operation(summary = "Réinitialiser le mot de passe")
    void resetPassword(@Valid @RequestBody ResetPasswordRequest request);
}
