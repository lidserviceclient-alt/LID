package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.dto.AuthResponse;
import com.lifeevent.lid.auth.dto.LoginRequest;
import com.lifeevent.lid.auth.dto.RefreshResponse;
import com.lifeevent.lid.auth.dto.ResetPasswordRequest;
import com.lifeevent.lid.auth.dto.UserJwt;
import com.lifeevent.lid.auth.entity.PasswordResetToken;
import com.lifeevent.lid.auth.entity.RefreshToken;
import com.lifeevent.lid.auth.repository.PasswordResetTokenRepository;
import com.lifeevent.lid.core.entity.Authentification;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.FournisseurAuth;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.AuthentificationRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtDecoder googleJwtDecoder;
    private final BearerTokenResolver bearerTokenResolver;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UtilisateurRepository utilisateurRepository;
    private final AuthentificationRepository authentificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final CartService cartService;

    @Value("${config.security.app.refresh-ttl-days}")
    private int refreshTtlDays;
    @Value("${config.security.app.reset-code-ttl-minutes:15}")
    private int resetCodeTtlMinutes;
    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response){
        String idToken = bearerTokenResolver.resolve(request);
        Jwt googleJwt = googleJwtDecoder.decode(idToken);
        
        // Extract info from Google Token
        String googleId = googleJwt.getSubject();
        String email = googleJwt.getClaimAsString("email");
        String firstName = googleJwt.getClaimAsString("given_name");
        String lastName = googleJwt.getClaimAsString("family_name");
        String avatarUrl = googleJwt.getClaimAsString("picture");

        // 1. Check if Authentication exists
        Optional<Authentification> authOpt = authentificationRepository.findByFournisseurAndIdentifiantFournisseur(
                FournisseurAuth.GOOGLE, googleId);

        Utilisateur utilisateur;

        if (authOpt.isPresent()) {
            // User exists via Google Auth
            utilisateur = authOpt.get().getUtilisateur();
            // Update profile if needed
            boolean changed = false;
            if (avatarUrl != null && !avatarUrl.equals(utilisateur.getAvatarUrl())) {
                utilisateur.setAvatarUrl(avatarUrl);
                changed = true;
            }
            if (firstName != null && !firstName.equals(utilisateur.getPrenom())) {
                utilisateur.setPrenom(firstName);
                changed = true;
            }
            if (lastName != null && !lastName.equals(utilisateur.getNom())) {
                utilisateur.setNom(lastName);
                changed = true;
            }
            if (changed) {
                utilisateurRepository.save(utilisateur);
            }
        } else {
            // 2. Check if user exists by email
            Optional<Utilisateur> userByEmail = utilisateurRepository.findByEmail(email);

            if (userByEmail.isPresent()) {
                // Link existing user to Google
                utilisateur = userByEmail.get();
            } else {
                // Create new user
                utilisateur = new Utilisateur();
                utilisateur.setEmail(email);
                utilisateur.setPrenom(firstName);
                utilisateur.setNom(lastName);
                utilisateur.setAvatarUrl(avatarUrl);
                utilisateur.setRole(RoleUtilisateur.CLIENT);
                utilisateur.setEmailVerifie(true); // Google verified
                utilisateur = utilisateurRepository.save(utilisateur);
            }

            // Create Authentication entry
            Authentification auth = new Authentification();
            auth.setUtilisateur(utilisateur);
            auth.setFournisseur(FournisseurAuth.GOOGLE);
            auth.setIdentifiantFournisseur(googleId);
            authentificationRepository.save(auth);
        }

        ensureCustomerAndCart(utilisateur);

        // Generate Tokens
        List<String> roles = List.of(mapRole(utilisateur.getRole()));
        UserJwt userJwt = mapToUserJwt(utilisateur);
        String accessToken = jwtService.generateAccessToken(userJwt, roles);
        
        // Create Refresh Token
        RefreshToken refreshToken = refreshTokenService.create(utilisateur.getId());
        setRefreshCookie(response, refreshToken.getId());

        return new AuthResponse(accessToken);
    }

    private void ensureCustomerAndCart(Utilisateur utilisateur) {
        String userId = utilisateur.getId();
        boolean exists = customerRepository.existsById(userId);
        if (!exists) {
            Customer customer = Customer.builder()
                    .userId(userId)
                    .email(utilisateur.getEmail())
                    .emailVerified(Boolean.TRUE.equals(utilisateur.getEmailVerifie()))
                    .firstName(utilisateur.getPrenom())
                    .lastName(utilisateur.getNom())
                    .avatarUrl(utilisateur.getAvatarUrl())
                    .build();
            customerRepository.save(customer);
        }

        if (cartService.getCartByCustomerId(userId).isEmpty()) {
            cartService.createCart(userId);
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse loginLocal(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));

        if (utilisateur.getRole() != RoleUtilisateur.ADMIN && utilisateur.getRole() != RoleUtilisateur.SUPER_ADMIN) {
            throw new IllegalArgumentException("Accès refusé");
        }

        Authentification auth = authentificationRepository
                .findByUtilisateurAndFournisseur(utilisateur, FournisseurAuth.LOCAL)
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));

        if (auth.getMotDePasseHash() == null || auth.getMotDePasseHash().isBlank()) {
            throw new IllegalArgumentException("Identifiants invalides");
        }

        boolean matches;
        try {
            matches = passwordEncoder.matches(request.getPassword(), auth.getMotDePasseHash());
        } catch (IllegalArgumentException ex) {
            matches = false;
        }

        if (!matches) {
            throw new IllegalArgumentException("Identifiants invalides");
        }

        List<String> roles = List.of(mapRole(utilisateur.getRole()));
        UserJwt userJwt = mapToUserJwt(utilisateur);
        String accessToken = jwtService.generateAccessToken(userJwt, roles);
        return new AuthResponse(accessToken);
    }

    @Transactional(readOnly = true)
    public RefreshResponse refresh(String refreshTokenId){
        RefreshToken rt = refreshTokenService.validate(UUID.fromString(refreshTokenId));
        
        Utilisateur utilisateur = utilisateurRepository.findById(rt.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        List<String> roles = List.of(mapRole(utilisateur.getRole()));
        UserJwt userJwt = mapToUserJwt(utilisateur);

        String newAccessToken = jwtService.generateAccessToken(userJwt, roles);
        return new RefreshResponse(newAccessToken);
    }

    @Transactional
    public void logout(String refreshTokenId, HttpServletResponse response) {
        if (refreshTokenId != null && !refreshTokenId.isBlank()) {
            refreshTokenService.revoke(UUID.fromString(refreshTokenId));
        }
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(!"local".equals(activeProfile));
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    @Transactional
    public String requestPasswordReset(String email) {
        boolean isLocalH2 = activeProfile != null && activeProfile.contains("local-h2");
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseGet(() -> {
                    if (!isLocalH2) {
                        return null;
                    }
                    Utilisateur created = new Utilisateur();
                    created.setEmail(email);
                    created.setEmailVerifie(true);
                    created.setNom("Dev");
                    created.setPrenom("Admin");
                    created.setRole(RoleUtilisateur.ADMIN);
                    return utilisateurRepository.save(created);
                });
        if (utilisateur == null) {
            return null;
        }
        passwordResetTokenRepository.findByUtilisateurAndUsedFalse(utilisateur)
                .ifPresent(token -> {
                    token.setUsed(true);
                    passwordResetTokenRepository.save(token);
                });

        String code = generateResetCode();
        PasswordResetToken token = PasswordResetToken.builder()
                .code(code)
                .utilisateur(utilisateur)
                .expiryDate(LocalDateTime.now().plusMinutes(resetCodeTtlMinutes))
                .used(false)
                .build();
        passwordResetTokenRepository.save(token);
        emailService.sendPasswordResetCode(utilisateur.getEmail(), code);
        if (isLocalH2) {
            return code;
        }
        return null;
    }

    @Transactional(readOnly = true)
    public void verifyResetCode(String code) {
        PasswordResetToken token = passwordResetTokenRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Code invalide"));
        if (token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code expiré");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByCode(request.getCode())
                .orElseThrow(() -> new IllegalArgumentException("Code invalide"));
        if (token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code expiré");
        }

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        Utilisateur utilisateur = token.getUtilisateur();
        Authentification auth = authentificationRepository
                .findByUtilisateurAndFournisseur(utilisateur, FournisseurAuth.LOCAL)
                .orElseGet(() -> {
                    Authentification newAuth = new Authentification();
                    newAuth.setUtilisateur(utilisateur);
                    newAuth.setFournisseur(FournisseurAuth.LOCAL);
                    newAuth.setIdentifiantFournisseur(utilisateur.getEmail());
                    return newAuth;
                });
        auth.setMotDePasseHash(passwordEncoder.encode(request.getNewPassword()));
        authentificationRepository.save(auth);
    }

    private UserJwt mapToUserJwt(Utilisateur utilisateur) {
        return UserJwt.builder()
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .firstName(utilisateur.getPrenom())
                .lastName(utilisateur.getNom())
                .avatarUrl(utilisateur.getAvatarUrl())
                .build();
    }
    
    private String mapRole(RoleUtilisateur role) {
        if (role == null) return "USER";
        return switch (role) {
            case CLIENT -> "CUSTOMER";
            case PARTENAIRE -> "PARTNER";
            case ADMIN -> "ADMIN";
            default -> role.name();
        };
    }

    private void setRefreshCookie(HttpServletResponse response, UUID refreshTokenId) {
        // Create secure cookie
        Cookie cookie = new Cookie("refresh_token", refreshTokenId.toString());
        cookie.setHttpOnly(true);
        cookie.setSecure(!"local".equals(activeProfile)); // Secure in prod
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(refreshTtlDays * 24 * 60 * 60);
        response.addCookie(cookie);
    }

    private String generateResetCode() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }
}
