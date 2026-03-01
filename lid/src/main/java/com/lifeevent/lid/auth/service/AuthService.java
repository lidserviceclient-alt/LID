package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.constant.AuthenticationType;
import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.dto.AuthCustomerResponse;
import com.lifeevent.lid.auth.dto.AuthPartnerResponse;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.dto.UserJwt;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.entity.RefreshToken;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.partner.dto.PartnerResponseDto;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import com.lifeevent.lid.user.partner.service.PartnerService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtDecoder googleJwtDecoder;
    private final BearerTokenResolver bearerTokenResolver;
    private final JwtService jwtService;
    private final CustomerService customerService;
    private final PartnerService partnerService;
    private final PartnerRepository partnerRepository;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationRepository authenticationRepository;
    private final UserEntityRepository userEntityRepository;

    @Value("${config.security.app.refresh-ttl-days}")
    private int refreshTtlDays;
    @Value("${spring.profiles.active}")
    private String activeProfile;

    public AuthCustomerResponse loginCustomerWithGoogle(HttpServletRequest request, HttpServletResponse response){
        UserJwt userJwt = extractUserJwtFromGoogle(request, List.of(UserRole.CUSTOMER));
        assertUserNotBlocked(userJwt.getUserId());
        Authentication authentication = upsertAuthentication(userJwt.getUserId(), UserRole.CUSTOMER);
        PartnerResponseDto partner = partnerService.getPartnerById(userJwt.getUserId()).orElse(null);
        if (partner != null) {
            authentication = syncPartnerRole(authentication, partner.getRegistrationStatus());
        } else {
            authentication = removeRole(authentication, UserRole.PARTNER);
        }
        List<String> roles = toRoleNames(authentication.getRoles());
        String accessToken = jwtService.generateAccessToken(userJwt.getUserId(), userJwt.getEmail(), roles);
        RefreshToken refreshToken = refreshTokenService.create(userJwt.getUserId());
        setRefreshCookie(response, refreshToken.getId());

        CustomerDto LoggedUser = customerService.getCustomerById(userJwt.getUserId())
                .orElseGet(() -> customerService.createCustomer(mapUserJwt(userJwt)));
        return AuthCustomerResponse.builder()
                .accessToken(accessToken)
                .loggedCustomer(LoggedUser)
                .build();
    }

    public AuthPartnerResponse loginPartnerWithGoogle(HttpServletRequest request, HttpServletResponse response){
        UserJwt userJwt = extractUserJwtFromGoogle(request, List.of(UserRole.PARTNER));
        assertUserNotBlocked(userJwt.getUserId());
        Authentication authentication = getOrCreateAuthentication(userJwt.getUserId());
        PartnerResponseDto loggedPartner = partnerService.getPartnerById(userJwt.getUserId())
                .orElseGet(() -> createPartnerFromGoogle(userJwt));
        authentication = syncPartnerRole(authentication, loggedPartner.getRegistrationStatus());
        List<String> roles = toRoleNames(authentication.getRoles());
        String accessToken = jwtService.generateAccessToken(userJwt.getUserId(), userJwt.getEmail(), roles);
        RefreshToken refreshToken = refreshTokenService.create(userJwt.getUserId());
        setRefreshCookie(response, refreshToken.getId());

        return AuthPartnerResponse.builder()
                .accessToken(accessToken)
                .loggedPartner(loggedPartner)
                .build();
    }


    private UserJwt extractUserJwtFromGoogle(HttpServletRequest request, List<UserRole> roles){
        String idToken = bearerTokenResolver.resolve(request);
        Jwt googleJwt = googleJwtDecoder.decode(idToken);
        List<String> roleNames = roles.stream().map(Enum::name).collect(Collectors.toList());
        return jwtService.extractUserFromJwt(googleJwt, roleNames);
    }

    private Authentication getOrCreateAuthentication(String userId){
        Authentication authentication = authenticationRepository.findById(userId)
                .orElseGet(() -> Authentication.builder()
                        .userId(userId)
                        .roles(new ArrayList<>())
                        .type(AuthenticationType.GOOGLE)
                        .build());
        if (authentication.getRoles() == null) {
            authentication.setRoles(new ArrayList<>());
        }
        if (authentication.getType() == null) {
            authentication.setType(AuthenticationType.GOOGLE);
        }
        return authenticationRepository.save(authentication);
    }

    private Authentication upsertAuthentication(String userId, UserRole role){
        Authentication authentication = getOrCreateAuthentication(userId);
        if (!authentication.getRoles().contains(role)) {
            authentication.getRoles().add(role);
        }
        return authenticationRepository.save(authentication);
    }

    private Authentication addRole(Authentication authentication, UserRole role) {
        if (authentication.getRoles() == null) {
            authentication.setRoles(new ArrayList<>());
        }
        if (!authentication.getRoles().contains(role)) {
            authentication.getRoles().add(role);
        }
        return authenticationRepository.save(authentication);
    }

    private Authentication removeRole(Authentication authentication, UserRole role) {
        if (authentication.getRoles() == null) {
            authentication.setRoles(new ArrayList<>());
        }
        if (authentication.getRoles().remove(role)) {
            return authenticationRepository.save(authentication);
        }
        return authentication;
    }

    private Authentication syncPartnerRole(Authentication authentication, PartnerRegistrationStatus status) {
        if (hasCompletedPartnerRegistration(status)) {
            return addRole(authentication, UserRole.PARTNER);
        }
        return removeRole(authentication, UserRole.PARTNER);
    }

    private boolean hasCompletedPartnerRegistration(PartnerRegistrationStatus status) {
        if (status == null) {
            return false;
        }
        return status == PartnerRegistrationStatus.VERIFIED;
    }

    private List<String> toRoleNames(List<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream().map(Enum::name).collect(Collectors.toList());
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

    private PartnerResponseDto createPartnerFromGoogle(UserJwt userJwt) {
        Partner partner = Partner.builder()
                .userId(userJwt.getUserId())
                .email(userJwt.getEmail())
                .emailVerified(Boolean.TRUE.equals(userJwt.getEmailVerified()))
                .firstName(userJwt.getFirstName())
                .lastName(userJwt.getLastName())
                .build();
        Partner saved = partnerRepository.save(partner);
        return partnerService.getPartnerById(saved.getUserId())
                .orElseGet(() -> PartnerResponseDto.builder()
                        .userId(saved.getUserId())
                        .firstName(saved.getFirstName())
                        .lastName(saved.getLastName())
                        .email(saved.getEmail())
                        .registrationStatus(saved.getRegistrationStatus())
                        .build());
    }


    public RefreshResponse refresh(String refreshTokenId){
        RefreshToken rt = refreshTokenService.validate(UUID.fromString(refreshTokenId));
        assertUserNotBlocked(rt.getUserId());
        UserDto userDto = userService.getUserById(rt.getUserId());
        Authentication authentication = authenticationRepository.findById(rt.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authentication not found"));
        List<String> roles = toRoleNames(authentication.getRoles());
        String newAccessToken = jwtService.generateAccessToken(userDto.getId(), userDto.getEmail(), roles);
        return new RefreshResponse(newAccessToken);
    }

    private void assertUserNotBlocked(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        boolean blocked = userEntityRepository.findById(userId)
                .map(user -> Boolean.TRUE.equals(user.getBlocked()))
                .orElse(false);
        if (blocked) {
            throw new ResponseStatusException(FORBIDDEN, "Compte utilisateur bloque.");
        }
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
