package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.AuthResponse;
import com.lifeevent.lid.auth.dto.ForgotPasswordRequest;
import com.lifeevent.lid.auth.dto.ForgotPasswordResponse;
import com.lifeevent.lid.auth.dto.LoginRequest;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.dto.ResetPasswordRequest;
import com.lifeevent.lid.auth.dto.VerifyResetCodeRequest;
import com.lifeevent.lid.auth.dto.VerifyAdminMfaRequest;
import com.lifeevent.lid.auth.service.AuthService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


/**
 * Controller pour la gestion de l'authentification
 * 
 * Implémente les endpoints d'authentification via Google OAuth2,
 * rafraîchissement du token JWT et déconnexion.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController implements IAuthController {

    private final AuthService authService;

    @Override
    @PostMapping("/login")
    public AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        return authService.loginWithGoogle(request, response);
    }

    @Override
    @PostMapping("/login/local")
    public AuthResponse loginLocal(@Valid @RequestBody LoginRequest request) {
        return authService.loginLocal(request);
    }

    @PostMapping("/login/local/verify")
    public AuthResponse verifyAdminMfa(@Valid @RequestBody VerifyAdminMfaRequest request) {
        return authService.verifyAdminMfa(request.mfaTokenId(), request.code());
    }

    @Override
    @PostMapping("/refresh")
    public RefreshResponse refresh(
            @CookieValue(name = "refresh_token") String refreshTokenId
    ) {
        return authService.refresh(refreshTokenId);
    }

    @Override
    @PostMapping("/logout")
    public void logout(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenId,
            HttpServletResponse response
    ) {
        authService.logout(refreshTokenId, response);
    }

    @Override
    @PostMapping("/password/forgot")
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String devCode = authService.requestPasswordReset(request.getEmail());
        return new ForgotPasswordResponse("Si l'email existe, un code a été envoyé.", devCode);
    }

    @Override
    @PostMapping("/password/verify")
    public void verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        authService.verifyResetCode(request.getCode());
    }

    @Override
    @PostMapping("/password/reset")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
}
