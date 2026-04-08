package com.lifeevent.lid.auth.controller;

import com.lifeevent.lid.auth.dto.*;
import com.lifeevent.lid.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public AuthCustomerResponse loginCustomerWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        return authService.loginCustomerWithGoogle(request, response);
    }

    @Override
    public AuthPartnerResponse loginPartnerWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        return authService.loginPartnerWithGoogle(request, response);
    }

    @Override
    public AuthResponse loginLidBackofficeLocal(@Valid @RequestBody LoginRequest request) {
        return authService.loginLidBackofficeLocal(request);
    }

    @Override
    public AuthResponse loginDeliveryLocal(@Valid @RequestBody LoginRequest request) {
        return authService.loginDeliveryLocal(request);
    }

    @Override
    public AuthResponse loginPartnerLocal(@Valid @RequestBody LoginRequest request) {
        return authService.loginPartnerLocal(request);
    }

    @Override
    public AuthResponse verifyAdminMfa(@Valid @RequestBody VerifyAdminMfaRequest request) {
        return authService.verifyAdminMfa(request.mfaTokenId(), request.code());
    }

    @Override
    public RefreshResponse refresh(@CookieValue(name = "refresh_token", required = false) String refreshTokenId) {
        return authService.refresh(refreshTokenId);
    }

    @Override
    public void logout(@CookieValue(name = "refresh_token", required = false) String refreshTokenId,
                       HttpServletResponse response) {
        authService.logout(refreshTokenId, response);
    }

    @Override
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String devCode = authService.requestPasswordReset(request.getEmail());
        return new ForgotPasswordResponse("Si l'email existe, un code a ete envoye.", devCode);
    }

    @Override
    public void verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        authService.verifyResetCode(request.getCode());
    }

    @Override
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
}
