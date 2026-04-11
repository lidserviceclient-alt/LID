package com.lifeevent.lid.user.partner.service.impl;

import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.lid.notification.dto.CreateBackOfficeNotificationRequest;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import com.lifeevent.lid.backoffice.lid.notification.service.BackOfficeNotificationService;
import com.lifeevent.lid.auth.service.AuthService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.common.util.PhoneNumberUtils;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.partner.dto.*;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.entity.ShopStatusEnum;
import com.lifeevent.lid.user.partner.mapper.PartnerMapper;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import com.lifeevent.lid.user.partner.repository.ShopRepository;
import com.lifeevent.lid.user.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * Service Partner - Implémentation
 * Réutilise UserService pour les opérations génériques sur les utilisateurs
 * Implémente la logique spécifique au Partner (onboarding en 5 étapes)
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PartnerServiceImpl implements PartnerService {
    
    private final PartnerRepository partnerRepository;
    private final ShopRepository shopRepository;
    private final PartnerMapper partnerMapper;
    private final UserService userService;
    private final AuthService authService;
    private final CategoryRepository categoryRepository;
    private final UserEntityRepository userEntityRepository;
    private final BackOfficeNotificationService backOfficeNotificationService;
    
    @Override
    public PartnerRegisterStep1ResponseDto registerStep1(PartnerRegisterStep1RequestDto dto) {
        log.info("PARTNER STEP-1 - email={}", dto.getEmail());
        validateEmailAvailability(dto.getEmail());
        String rawPassword = firstNonBlank(dto.getPassword());
        UserEntity user = createBaseUserForPartnerStep1(dto);
        Partner partnerProfile = new Partner();
        partnerProfile.setUser(user);
        partnerProfile.setPhoneNumber(normalizePhone(dto.getPhoneNumber()));
        partnerProfile.setRegistrationStatus(PartnerRegistrationStatus.STEP_1_PENDING);
        partnerProfile.setContractAccepted(Boolean.FALSE);
        Partner saved = partnerRepository.saveAndFlush(partnerProfile);
        ensureCustomerAccount(saved);
        authService.upsertPartnerLocalAuthentication(
                saved.getUserId(),
                rawPassword == null ? null : authService.hashLocalPassword(rawPassword)
        );
        PartnerResponseDto partner = partnerMapper.toResponseDto(saved);
        String accessToken = authService.generatePartnerAccessToken(saved.getUserId(), saved.getEmail());
        return PartnerRegisterStep1ResponseDto.builder()
                .partner(partner)
                .accessToken(accessToken)
                .build();
    }

    @Override
    public PartnerResponseDto registerStep2(PartnerRegisterStep2RequestDto dto) {
        String partnerId = requireAuthenticatedPartnerId();
        log.info("PARTNER STEP-2 - partnerId={}", partnerId);
        Partner partner = requirePartner(partnerId);
        Category mainCategory = requireCategory(dto.getMainCategoryId());
        Shop shop = upsertShop(partner, mainCategory, dto);
        partner.setShop(shop);
        partner.setHeadOfficeAddress(normalize(dto.getHeadOfficeAddress()));
        partner.setCity(normalize(dto.getCity()));
        partner.setCountry(normalize(dto.getCountry()));
        partner.setNinea(normalize(dto.getNinea()));
        partner.setRccm(normalize(dto.getRccm()));
        partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_2_PENDING);
        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        return partnerMapper.toResponseDto(saved);
    }

    @Override
    public PartnerResponseDto upgradeCustomerToPartner(String userId, PartnerRegisterStep1RequestDto dto) {
        String currentUserId = requireCurrentUserId(userId);
        log.info("PARTNER UPGRADE - userId={}", currentUserId);

        var existingUser = userEntityRepository.findById(currentUserId);
        if (existingUser.isEmpty()) {
            UserEntity user = userEntityRepository.save(UserEntity.builder()
                    .userId(currentUserId)
                    .email(normalize(dto.getEmail()))
                    .emailVerified(false)
                    .firstName(normalize(dto.getFirstName()))
                    .lastName(normalize(dto.getLastName()))
                    .blocked(Boolean.FALSE)
                    .build());
            Partner partner = new Partner();
            partner.setUser(user);
            partner.setPhoneNumber(normalizePhone(dto.getPhoneNumber()));
            partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_1_PENDING);
            partner.setContractAccepted(Boolean.FALSE);
            Partner saved = partnerRepository.save(partner);
            userService.upsertPartnerProfile(saved);
            ensureCustomerAccount(saved);
            return partnerMapper.toResponseDto(saved);
        }

        Partner partner = partnerRepository.findById(currentUserId)
                .orElseGet(() -> {
                    var user = existingUser.get();
                    user.setEmail(firstNonBlank(normalize(dto.getEmail()), user.getEmail()));
                    user.setFirstName(firstNonBlank(normalize(dto.getFirstName()), user.getFirstName()));
                    user.setLastName(firstNonBlank(normalize(dto.getLastName()), user.getLastName()));
                    UserEntity savedUser = userEntityRepository.save(user);
                    Partner created = new Partner();
                    created.setUser(savedUser);
                    created.setPhoneNumber(normalizePhone(dto.getPhoneNumber()));
                    created.setRegistrationStatus(PartnerRegistrationStatus.STEP_1_PENDING);
                    created.setContractAccepted(Boolean.FALSE);
                    return created;
                });
        applyIdentityUpdates(partner, dto.getFirstName(), dto.getLastName(), dto.getPhoneNumber());
        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        ensureCustomerAccount(saved);
        return partnerMapper.toResponseDto(saved);
    }

    @Override
    public PartnerResponseDto registerStep3(PartnerRegisterStep3RequestDto dto) {
        String partnerId = requireAuthenticatedPartnerId();
        log.info("PARTNER STEP-3 - partnerId={}", partnerId);
        Partner partner = requirePartnerWithShop(partnerId);
        applyMediaUpdates(partner, dto);
        partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_3_PENDING);
        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        return partnerMapper.toResponseDto(saved);
    }

    @Override
    public PartnerResponseDto registerStep4(PartnerRegisterStep4RequestDto dto) {
        String partnerId = requireAuthenticatedPartnerId();
        log.info("PARTNER STEP-4 - partnerId={}", partnerId);
        Partner partner = requirePartnerWithShop(partnerId);
        if (!Boolean.TRUE.equals(dto.getContractAccepted())) {
            throw new IllegalArgumentException("Le contrat doit être accepté");
        }
        partner.setContractAccepted(true);
        partner.setIdDocumentUrl(normalize(dto.getIdDocumentUrl()));
        partner.setNineaDocumentUrl(normalize(dto.getNineaDocumentUrl()));
        partner.setSupportingDocumentsZipUrl(normalize(dto.getSupportingDocumentsZipUrl()));
        // TODO : En attente de vérification (KYC)
        partner.setRegistrationStatus(PartnerRegistrationStatus.UNDER_REVIEW);
        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        backOfficeNotificationService.create(CreateBackOfficeNotificationRequest.builder()
                .type(BackOfficeNotificationType.NEW_PARTNER_UNDER_REVIEW)
                .scope(BackOfficeNotificationScope.BACKOFFICE)
                .targetRole(BackOfficeNotificationTargetRole.ADMIN)
                .title("Nouveau partenaire à valider")
                .body("Le partenaire " + saved.getUserId() + " est en attente de revue")
                .actionPath("/partners")
                .actionLabel("Ouvrir")
                .severity(BackOfficeNotificationSeverity.INFO)
                .dedupeKey("PARTNER_UNDER_REVIEW:" + saved.getUserId())
                .payload(java.util.Map.of("partnerId", saved.getUserId()))
                .build());
        return partnerMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerRegistrationAggregateDto getRegistrationAggregate() {
        String partnerId = requireAuthenticatedPartnerId();
        Partner partner = requirePartnerWithShop(partnerId);
        int completedStep = completedStep(partner.getRegistrationStatus());

        return PartnerRegistrationAggregateDto.builder()
                .partner(partnerMapper.toResponseDto(partner))
                .step1(completedStep >= 1 ? toStep1(partner) : null)
                .step2(completedStep >= 2 ? toStep2(partner) : null)
                .step3(completedStep >= 3 ? toStep3(partner) : null)
                .step4(completedStep >= 4 ? toStep4(partner) : null)
                .currentStatus(partner.getRegistrationStatus())
                .nextStep(completedStep >= 4 ? null : completedStep + 1)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PartnerResponseDto> getPartnerById(String partnerId) {
        return partnerRepository.findByUserIdWithShop(partnerId).map(partnerMapper::toResponseDto);
    }

    @Override
    public PartnerResponseDto updatePartner(String partnerId, PartnerResponseDto dto) {
        log.info("PARTNER UPDATE - partnerId={}", partnerId);
        ensureCanManagePartner(partnerId);
        Partner partner = requirePartner(partnerId);
        applyIdentityUpdates(partner, dto.getFirstName(), dto.getLastName(), dto.getPhoneNumber());
        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        return partnerMapper.toResponseDto(saved);
    }

    @Override
    public void deletePartner(String partnerId) {
        log.info("PARTNER DELETE - partnerId={}", partnerId);
        //ensureCanManagePartner(partnerId);
        partnerRepository.delete(requirePartner(partnerId));
    }

    private void validateEmailAvailability(String email) {
        if (userService.emailExists(email)) {
            throw new IllegalArgumentException("L'email existe déjà dans le système");
        }
    }

    private void ensureCustomerAccount(Partner partner) {
        userService.getOrCreateCustomerAccount(
                partner.getUserId(),
                partner.getEmail(),
                partner.isEmailVerified(),
                partner.getFirstName(),
                partner.getLastName(),
                partner.getBlocked()
        );
    }

    private UserEntity createBaseUserForPartnerStep1(PartnerRegisterStep1RequestDto dto) {
        String userId = UUID.randomUUID().toString();
        return userEntityRepository.save(UserEntity.builder()
                .userId(userId)
                .email(normalize(dto.getEmail()))
                .emailVerified(false)
                .firstName(normalize(dto.getFirstName()))
                .lastName(normalize(dto.getLastName()))
                .blocked(Boolean.FALSE)
                .build());
    }

    private Shop upsertShop(Partner partner, Category mainCategory, PartnerRegisterStep2RequestDto dto) {
        Shop shop = partner.getShop() == null ? new Shop() : partner.getShop();
        shop.setPartner(partner);
        shop.setMainCategory(mainCategory);
        shop.setShopName(dto.getShopName());
        shop.setShopDescription(normalize(dto.getShopDescription()));
        shop.setDescription(firstNonBlank(dto.getDescription(), dto.getShopDescription(), dto.getShopName()));
        shop.setLogoUrl(firstNonBlank(shop.getLogoUrl(), "/imgs/logo.png"));
        shop.setBackgroundUrl(firstNonBlank(shop.getBackgroundUrl(), "/imgs/wall-1.jpg"));
        shop.setStatus(shop.getStatus() == null ? ShopStatusEnum.PRINCIPALE : shop.getStatus());
        return shopRepository.save(shop);
    }

    private void applyMediaUpdates(Partner partner, PartnerRegisterStep3RequestDto dto) {
        Shop shop = partner.getShop();
        if (shop == null) {
            throw new IllegalArgumentException("Boutique introuvable pour l'etape 3");
        }
        shop.setLogoUrl(firstNonBlank(dto.getLogoUrl(), shop.getLogoUrl(), "/imgs/logo.png"));
        shop.setBackgroundUrl(firstNonBlank(dto.getBannerUrl(), shop.getBackgroundUrl(), "/imgs/wall-1.jpg"));
        shopRepository.save(shop);
        partner.setBusinessRegistrationDocumentUrl(normalize(dto.getBusinessRegistrationDocumentUrl()));
    }

    private void applyIdentityUpdates(Partner partner, String firstName, String lastName, String phoneNumber) {
        if (firstName != null) {
            partner.setFirstName(firstName);
        }
        if (lastName != null) {
            partner.setLastName(lastName);
        }
        if (phoneNumber != null) {
            partner.setPhoneNumber(normalizePhone(phoneNumber));
        }
    }

    private Partner requirePartner(String partnerId) {
        return partnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
    }

    private Partner requirePartnerWithShop(String partnerId) {
        return partnerRepository.findByUserIdWithShop(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
    }

    private Category requireCategory(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category non trouvée", "categoryId", String.valueOf(categoryId)));
    }

    private String normalizePhone(String value) {
        return PhoneNumberUtils.normalizeE164OrNull(value);
    }

    private void ensureCanManagePartner(String partnerId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank() || "anonymousUser".equalsIgnoreCase(currentUserId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        if (!currentUserId.equals(partnerId)) {
            throw new ResponseStatusException(FORBIDDEN);
        }
    }

    private String requireAuthenticatedPartnerId() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank() || "anonymousUser".equalsIgnoreCase(currentUserId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        if (!SecurityUtils.isPartner()) {
            throw new ResponseStatusException(FORBIDDEN);
        }
        return currentUserId;
    }

    private String requireCurrentUserId(String userId) {
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String normalized = normalize(value);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
    }

    private int completedStep(PartnerRegistrationStatus status) {
        if (status == null || status == PartnerRegistrationStatus.STEP_1_PENDING) {
            return 1;
        }
        if (status == PartnerRegistrationStatus.STEP_2_PENDING) {
            return 2;
        }
        if (status == PartnerRegistrationStatus.STEP_3_PENDING) {
            return 3;
        }
        return 4;
    }

    private PartnerRegisterStep1RequestDto toStep1(Partner partner) {
        return PartnerRegisterStep1RequestDto.builder()
                .firstName(partner.getFirstName())
                .lastName(partner.getLastName())
                .email(partner.getEmail())
                .phoneNumber(partner.getPhoneNumber())
                .password(null)
                .build();
    }

    private PartnerRegisterStep2RequestDto toStep2(Partner partner) {
        Shop shop = partner.getShop();
        return PartnerRegisterStep2RequestDto.builder()
                .shopName(shop == null ? null : shop.getShopName())
                .mainCategoryId(shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getId())
                .shopDescription(shop == null ? null : shop.getShopDescription())
                .description(shop == null ? null : shop.getDescription())
                .headOfficeAddress(partner.getHeadOfficeAddress())
                .city(partner.getCity())
                .country(partner.getCountry())
                .ninea(partner.getNinea())
                .rccm(partner.getRccm())
                .build();
    }

    private PartnerRegisterStep3RequestDto toStep3(Partner partner) {
        Shop shop = partner.getShop();
        return PartnerRegisterStep3RequestDto.builder()
                .logoUrl(shop == null ? null : shop.getLogoUrl())
                .bannerUrl(shop == null ? null : shop.getBackgroundUrl())
                .businessRegistrationDocumentUrl(partner.getBusinessRegistrationDocumentUrl())
                .build();
    }

    private PartnerRegisterStep4RequestDto toStep4(Partner partner) {
        return PartnerRegisterStep4RequestDto.builder()
                .contractAccepted(partner.getContractAccepted())
                .idDocumentUrl(partner.getIdDocumentUrl())
                .nineaDocumentUrl(partner.getNineaDocumentUrl())
                .supportingDocumentsZipUrl(partner.getSupportingDocumentsZipUrl())
                .build();
    }

}
