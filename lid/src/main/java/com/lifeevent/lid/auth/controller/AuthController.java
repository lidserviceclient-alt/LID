package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.AuthResponse;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.service.AuthService;
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
    public AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        return authService.loginWithGoogle(request, response);
    }

    @Override
    public RefreshResponse refresh(
            @CookieValue(name = "refresh_token") String refreshTokenId
    ) {
        return authService.refresh(refreshTokenId);
    }

    @Override
    public void logout(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenId,
            HttpServletResponse response
    ) {
        authService.logout(refreshTokenId, response);
    }
}
