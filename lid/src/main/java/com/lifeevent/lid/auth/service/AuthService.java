package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.dto.AuthResponse;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.dto.UserJwt;
import com.lifeevent.lid.auth.entity.RefreshToken;
import com.lifeevent.lid.common.util.ResponseUtils;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtDecoder googleJwtDecoder;
    private final BearerTokenResolver bearerTokenResolver;
    private final JwtService jwtService;
    private final CustomerService customerService;
    private final RefreshTokenService refreshTokenService;

    @Value("${config.security.app.refresh-ttl-days}")
    private int refreshTtlDays;
    @Value("${spring.profiles.active}")
    private String activeProfile;

    public AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response){
        String idToken = bearerTokenResolver.resolve(request);
        Jwt googleJwt = googleJwtDecoder.decode(idToken);
        List<String> roles = List.of("CUSTOMER");
        UserJwt userJwt = jwtService.extractUserFromJwt(googleJwt, roles);
        String accessToken = jwtService.generateAccessToken(userJwt, roles);
        RefreshToken refreshToken = refreshTokenService.create(userJwt.getUserId());
        setRefreshCookie(response, refreshToken.getId());

        Optional<CustomerDto> loggedUser = customerService.getCustomerById(userJwt.getUserId());
        if (loggedUser.isEmpty()) {
            loggedUser = customerService.getCustomerByEmail(userJwt.getEmail());
        }
        if (loggedUser.isEmpty()) {
            if (!customerService.emailExists(userJwt.getEmail())) {
                customerService.createCustomer(mapUserJwt(userJwt));
            }
        } else {
            CustomerDto existing = loggedUser.get();
            String incomingAvatar = userJwt.getAvatarUrl();
            boolean needsAvatar = (existing.getAvatarUrl() == null || existing.getAvatarUrl().isBlank())
                    && incomingAvatar != null && !incomingAvatar.isBlank();
            boolean needsNames = (existing.getFirstName() == null || existing.getFirstName().isBlank()
                    || existing.getLastName() == null || existing.getLastName().isBlank())
                    && (userJwt.getFirstName() != null || userJwt.getLastName() != null);
            if (needsAvatar || needsNames) {
                CustomerDto updated = CustomerDto.builder()
                        .userId(existing.getUserId())
                        .firstName(needsNames ? userJwt.getFirstName() : existing.getFirstName())
                        .lastName(needsNames ? userJwt.getLastName() : existing.getLastName())
                        .email(existing.getEmail())
                        .avatarUrl(needsAvatar ? incomingAvatar : existing.getAvatarUrl())
                        .createdAt(existing.getCreatedAt())
                        .build();
                customerService.updateCustomer(existing.getUserId(), updated);
            }
        }

        return new AuthResponse(accessToken);
    }

    private CustomerDto mapUserJwt(UserJwt userJwt){
        return CustomerDto.builder()
                .userId(userJwt.getUserId())
                .email(userJwt.getEmail())
                .firstName(userJwt.getFirstName())
                .lastName(userJwt.getLastName())
                .avatarUrl(userJwt.getAvatarUrl())
                .build();
    }


    public RefreshResponse refresh(String refreshTokenId){
        RefreshToken rt = refreshTokenService.validate(UUID.fromString(refreshTokenId));
        Optional<CustomerDto> userFound = customerService.getCustomerById(rt.getUserId());
        CustomerDto customerDto = ResponseUtils.getOrThrow(userFound, "Customer", rt.getUserId());
        List<String> roles = List.of("USER");

        UserJwt userJwt = UserJwt.builder()
                .userId(customerDto.getUserId())
                .email(customerDto.getEmail())
                .firstName(customerDto.getFirstName())
                .lastName(customerDto.getLastName())
                .avatarUrl(customerDto.getAvatarUrl())
                .build();

        String newAccessToken = jwtService.generateAccessToken(userJwt, roles);
        return new RefreshResponse(newAccessToken);
    }

    public void logout(String refreshTokenId, HttpServletResponse response){
        if (refreshTokenId != null) {
            refreshTokenService.revoke(UUID.fromString(refreshTokenId));
        }
        clearRefreshCookie(response);
    }



    private void setRefreshCookie(HttpServletResponse response, UUID id) {
        Cookie cookie = new Cookie("refresh_token", id.toString());
        boolean isSecure = !activeProfile.equals("local");
        cookie.setHttpOnly(true);
        cookie.setSecure(isSecure);
        cookie.setPath("/auth");
        cookie.setMaxAge((int) Duration.ofDays(refreshTtlDays).getSeconds());
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        boolean isSecure = !activeProfile.equals("local");
        cookie.setHttpOnly(true);
        cookie.setSecure(isSecure);
        cookie.setPath("/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
