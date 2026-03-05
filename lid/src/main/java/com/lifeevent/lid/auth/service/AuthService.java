package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.constant.AuthenticationType;
import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.dto.*;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.entity.PasswordResetToken;
import com.lifeevent.lid.auth.entity.RefreshToken;
import com.lifeevent.lid.auth.enums.OneTimeCodePurpose;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.auth.repository.PasswordResetTokenRepository;
import com.lifeevent.lid.backoffice.setting.repository.BackOfficeSecuritySettingRepository;
import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.common.service.EmailService;
import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
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
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final CartService cartService;
    private final BackOfficeSecuritySettingRepository backOfficeSecuritySettingRepository;

    @Value("${config.security.app.refresh-ttl-days}")
    private int refreshTtlDays;

    @Value("${config.security.app.reset-code-ttl-minutes:15}")
    private int resetCodeTtlMinutes;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String UUID_REGEX =
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
    private static final String BCRYPT_HASH_REGEX =
            "^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$";

    @Transactional
    public AuthResponse loginWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        UserJwt userJwt = extractUserJwtFromGoogle(request, List.of(UserRole.CUSTOMER));
        assertUserNotBlocked(userJwt.getUserId());
        Authentication authentication = upsertAuthentication(userJwt.getUserId(), UserRole.CUSTOMER);
        ensureCustomerAndCart(userJwt);

        List<String> roles = toRoleNames(authentication.getRoles());
        String accessToken = jwtService.generateAccessToken(userJwt, roles);
        issueRefreshTokenCookie(response, userJwt.getUserId());

        return new AuthResponse(accessToken, Boolean.FALSE, null, null);
    }

    @Transactional
    public AuthCustomerResponse loginCustomerWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        UserJwt userJwt = extractUserJwtFromGoogle(request, List.of(UserRole.CUSTOMER));
        assertUserNotBlocked(userJwt.getUserId());

        Authentication authentication = upsertAuthentication(userJwt.getUserId(), UserRole.CUSTOMER);
        PartnerResponseDto partner = partnerService.getPartnerById(userJwt.getUserId()).orElse(null);
        authentication = (partner != null)
                ? syncPartnerRole(authentication, partner.getRegistrationStatus())
                : removeRole(authentication, UserRole.PARTNER);

        String accessToken = jwtService.generateAccessToken(userJwt, toRoleNames(authentication.getRoles()));
        issueRefreshTokenCookie(response, userJwt.getUserId());

        CustomerDto loggedCustomer = ensureCustomerAndCart(userJwt);
        return AuthCustomerResponse.builder()
                .accessToken(accessToken)
                .loggedCustomer(loggedCustomer)
                .build();
    }

    @Transactional
    public AuthPartnerResponse loginPartnerWithGoogle(HttpServletRequest request, HttpServletResponse response) {
        UserJwt userJwt = extractUserJwtFromGoogle(request, List.of(UserRole.PARTNER));
        assertUserNotBlocked(userJwt.getUserId());

        Authentication authentication = getOrCreateAuthentication(userJwt.getUserId());
        PartnerResponseDto loggedPartner = partnerService.getPartnerById(userJwt.getUserId())
                .orElseGet(() -> createPartnerFromGoogle(userJwt));
        authentication = syncPartnerRole(authentication, loggedPartner.getRegistrationStatus());

        String accessToken = jwtService.generateAccessToken(userJwt, toRoleNames(authentication.getRoles()));
        issueRefreshTokenCookie(response, userJwt.getUserId());

        return AuthPartnerResponse.builder()
                .accessToken(accessToken)
                .loggedPartner(loggedPartner)
                .build();
    }

    @Transactional
    public AuthResponse loginLocal(LoginRequest request) {
        UserEntity user = findUserByEmailOrThrow(request.getEmail());
        assertUserNotBlocked(user.getUserId());

        Authentication auth = findLocalAuthenticationOrThrow(user);
        assertBackOfficeRoleOrThrow(auth);
        assertPasswordMatchesOrThrow(request.getPassword(), auth.getPasswordHash());

        if (requiresAdminMfa(auth)) {
            return startAdminMfa(user);
        }

        String accessToken = buildAccessTokenForUser(user, auth);
        return new AuthResponse(accessToken, Boolean.FALSE, null, null);
    }

    @Transactional
    public AuthResponse verifyAdminMfa(String mfaTokenId, String code) {
        PasswordResetToken token = validateMfaTokenOrThrow(mfaTokenId, code);
        UserEntity user = token.getUser();

        Authentication auth = authenticationRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));
        assertBackOfficeRoleOrThrow(auth);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        String accessToken = buildAccessTokenForUser(user, auth);
        return new AuthResponse(accessToken, Boolean.FALSE, null, null);
    }

    @Transactional(readOnly = true)
    public RefreshResponse refresh(String refreshTokenId) {
        RefreshToken rt = refreshTokenService.validate(UUID.fromString(refreshTokenId));
        assertUserNotBlocked(rt.getUserId());

        UserDto userDto = userService.getUserById(rt.getUserId());
        Authentication authentication = authenticationRepository.findByUserId(rt.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authentication not found"));

        String newAccessToken = jwtService.generateAccessToken(
                userDto.getId(),
                userDto.getEmail(),
                toRoleNames(authentication.getRoles())
        );
        return new RefreshResponse(newAccessToken);
    }

    @Transactional
    public void logout(String refreshTokenId, HttpServletResponse response) {
        if (refreshTokenId != null && !refreshTokenId.isBlank()) {
            refreshTokenService.revoke(UUID.fromString(refreshTokenId));
        }
        clearRefreshCookie(response);
    }

    @Transactional
    public String requestPasswordReset(String email) {
        UserEntity user = findUserForPasswordReset(email);
        if (user == null) {
            return null;
        }

        expirePreviousUnusedCode(user, OneTimeCodePurpose.PASSWORD_RESET);

        String code = generateResetCode();
        PasswordResetToken token = PasswordResetToken.builder()
                .code(code)
                .purpose(OneTimeCodePurpose.PASSWORD_RESET)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(resetCodeTtlMinutes))
                .used(false)
                .build();
        passwordResetTokenRepository.save(token);

        sendPasswordResetCode(user.getEmail(), code);
        return isLocalProfile() ? code : null;
    }

    @Transactional(readOnly = true)
    public void verifyResetCode(String code) {
        PasswordResetToken token = getPasswordResetTokenOrThrow(code);
        assertTokenUsableOrThrow(token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = getPasswordResetTokenOrThrow(request.getCode());
        assertTokenUsableOrThrow(token);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        UserEntity user = token.getUser();
        Authentication auth = authenticationRepository.findByUserId(user.getUserId())
                .orElseGet(() -> Authentication.builder()
                        .userId(user.getUserId())
                        .roles(new ArrayList<>(List.of(UserRole.ADMIN)))
                        .type(AuthenticationType.LOCAL)
                        .build());

        if (auth.getRoles() == null || auth.getRoles().isEmpty()) {
            auth.setRoles(new ArrayList<>(List.of(UserRole.ADMIN)));
        }
        auth.setType(AuthenticationType.LOCAL);
        auth.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        authenticationRepository.save(auth);
    }

    private UserJwt extractUserJwtFromGoogle(HttpServletRequest request, List<UserRole> roles) {
        String idToken = bearerTokenResolver.resolve(request);
        Jwt googleJwt = googleJwtDecoder.decode(idToken);
        List<String> roleNames = roles.stream().map(Enum::name).toList();
        return jwtService.extractUserFromJwt(googleJwt, roleNames);
    }

    private Authentication getOrCreateAuthentication(String userId) {
        Authentication authentication = authenticationRepository.findByUserId(userId)
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

    private Authentication upsertAuthentication(String userId, UserRole role) {
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
        if (status == PartnerRegistrationStatus.VERIFIED) {
            return addRole(authentication, UserRole.PARTNER);
        }
        return removeRole(authentication, UserRole.PARTNER);
    }

    private List<String> toRoleNames(List<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream().map(Enum::name).toList();
    }

    private CustomerDto mapUserJwt(UserJwt userJwt) {
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

    private CustomerDto ensureCustomerAndCart(UserJwt userJwt) {
        CustomerDto customer = customerService.getCustomerById(userJwt.getUserId())
                .orElseGet(() -> customerService.createCustomer(mapUserJwt(userJwt)));

        if (cartService.getCartByCustomerId(customer.getUserId()).isEmpty()) {
            cartService.createCart(customer.getUserId());
        }
        return customer;
    }

    private UserEntity findUserByEmailOrThrow(String email) {
        return userEntityRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));
    }

    private Authentication findLocalAuthenticationOrThrow(UserEntity user) {
        Authentication auth = authenticationRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));

        if (auth.getPasswordHash() == null || auth.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Identifiants invalides");
        }

        return auth;
    }

    private void assertBackOfficeRoleOrThrow(Authentication auth) {
        List<UserRole> roles = auth.getRoles() == null ? List.of() : auth.getRoles();
        boolean allowed = roles.contains(UserRole.ADMIN)
                || roles.contains(UserRole.SUPER_ADMIN)
                || roles.contains(UserRole.LIVREUR);
        if (!allowed) {
            throw new IllegalArgumentException("Acces refuse");
        }
    }

    private void assertPasswordMatchesOrThrow(String rawPassword, String encodedPassword) {
        boolean matches = isSupportedPasswordHash(encodedPassword)
                && passwordEncoder.matches(rawPassword, encodedPassword);
        if (!matches) {
            throw new IllegalArgumentException("Identifiants invalides");
        }
    }

    private boolean requiresAdminMfa(Authentication auth) {
        List<UserRole> roles = auth.getRoles() == null ? List.of() : auth.getRoles();
        boolean isAdmin = roles.contains(UserRole.ADMIN) || roles.contains(UserRole.SUPER_ADMIN);
        return isAdmin && isAdmin2faEnabled();
    }

    private boolean isAdmin2faEnabled() {
        return backOfficeSecuritySettingRepository.findTopByOrderByIdAsc()
                .map(entity -> Boolean.TRUE.equals(entity.getAdmin2faEnabled()))
                .orElse(true);
    }

    private AuthResponse startAdminMfa(UserEntity user) {
        expirePreviousUnusedCode(user, OneTimeCodePurpose.ADMIN_LOGIN_2FA);

        String code = generateResetCode();
        PasswordResetToken token = PasswordResetToken.builder()
                .code(code)
                .purpose(OneTimeCodePurpose.ADMIN_LOGIN_2FA)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        PasswordResetToken saved = passwordResetTokenRepository.save(token);
        sendAdminLoginCode(user.getEmail(), code);

        return new AuthResponse(
                null,
                Boolean.TRUE,
                saved.getId().toString(),
                isLocalProfile() ? code : null
        );
    }

    private void expirePreviousUnusedCode(UserEntity user, OneTimeCodePurpose purpose) {
        passwordResetTokenRepository.findByUserAndPurposeAndUsedFalse(user, purpose)
                .ifPresent(existing -> {
                    existing.setUsed(true);
                    passwordResetTokenRepository.save(existing);
                });
    }

    private PasswordResetToken validateMfaTokenOrThrow(String mfaTokenId, String code) {
        String normalizedCode = normalizeSixDigitCode(code);
        if (normalizedCode == null) {
            throw new IllegalArgumentException("Code invalide");
        }

        if (mfaTokenId == null || !mfaTokenId.matches(UUID_REGEX)) {
            throw new IllegalArgumentException("Code invalide");
        }
        UUID id = UUID.fromString(mfaTokenId);

        PasswordResetToken token = passwordResetTokenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Code invalide"));

        if (token.getPurpose() != OneTimeCodePurpose.ADMIN_LOGIN_2FA) {
            throw new IllegalArgumentException("Code invalide");
        }

        if (token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code expire");
        }

        if (!normalizedCode.equals(token.getCode())) {
            throw new IllegalArgumentException("Code invalide");
        }

        return token;
    }

    private String buildAccessTokenForUser(UserEntity user, Authentication auth) {
        UserJwt userJwt = UserJwt.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(null)
                .build();

        return jwtService.generateAccessToken(userJwt, toRoleNames(auth.getRoles()));
    }

    private UserEntity findUserForPasswordReset(String email) {
        Optional<UserEntity> existing = userEntityRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        if (!isLocalH2Profile()) {
            return null;
        }

        UserEntity created = UserEntity.builder()
                .userId(UUID.randomUUID().toString())
                .email(email)
                .emailVerified(true)
                .firstName("Dev")
                .lastName("Admin")
                .blocked(false)
                .build();
        return userEntityRepository.save(created);
    }

    private PasswordResetToken getPasswordResetTokenOrThrow(String rawCode) {
        String normalizedCode = normalizeSixDigitCode(rawCode);
        if (normalizedCode == null) {
            throw new IllegalArgumentException("Code invalide");
        }

        return passwordResetTokenRepository.findByCodeAndPurpose(normalizedCode, OneTimeCodePurpose.PASSWORD_RESET)
                .orElseThrow(() -> new IllegalArgumentException("Code invalide"));
    }

    private void assertTokenUsableOrThrow(PasswordResetToken token) {
        if (token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code expire");
        }
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

    private void issueRefreshTokenCookie(HttpServletResponse response, String userId) {
        RefreshToken refreshToken = refreshTokenService.create(userId);
        setRefreshCookie(response, refreshToken.getId());
    }

    private void sendPasswordResetCode(String to, String code) {
        emailService.send(
                to,
                "Code de reinitialisation",
                "Votre code de reinitialisation est : " + code
        );
    }

    private void sendAdminLoginCode(String to, String code) {
        emailService.send(
                to,
                "Code de connexion (Admin)",
                "Votre code de connexion est : " + code
        );
    }

    private void setRefreshCookie(HttpServletResponse response, UUID id) {
        Cookie cookie = new Cookie("refresh_token", id.toString());
        cookie.setHttpOnly(true);
        cookie.setSecure(!isLocalProfile());
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge((int) Duration.ofDays(refreshTtlDays).getSeconds());
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(!isLocalProfile());
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String generateResetCode() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    private static String normalizeSixDigitCode(String raw) {
        if (raw == null) {
            return null;
        }
        String digits = raw.replaceAll("\\D", "");
        if (digits.isBlank() || digits.length() > 6) {
            return null;
        }
        return String.format("%6s", digits).replace(' ', '0');
    }

    private boolean isSupportedPasswordHash(String hash) {
        return hash != null && hash.matches(BCRYPT_HASH_REGEX);
    }

    private boolean isLocalProfile() {
        if (activeProfile == null) {
            return false;
        }
        String profile = activeProfile.toLowerCase();
        return profile.contains("local") || profile.contains("db-prod");
    }

    private boolean isLocalH2Profile() {
        return activeProfile != null && activeProfile.toLowerCase().contains("local-h2");
    }
}
