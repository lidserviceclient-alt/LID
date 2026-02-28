package com.lifeevent.lid.backoffice.setting.service.impl;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.backoffice.setting.dto.*;
import com.lifeevent.lid.backoffice.setting.entity.*;
import com.lifeevent.lid.backoffice.setting.repository.*;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.user.service.BackOfficeUserService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeSettingServiceImpl implements BackOfficeSettingService {

    private static final int SETTINGS_USERS_FETCH_SIZE = 500;

    private final BackOfficeUserService backOfficeUserService;
    private final BackOfficeAppConfigRepository appConfigRepository;
    private final BackOfficeSocialLinkRepository socialLinkRepository;
    private final BackOfficeFreeShippingRuleRepository freeShippingRuleRepository;
    private final BackOfficeShippingMethodRepository shippingMethodRepository;
    private final BackOfficeSecuritySettingRepository securitySettingRepository;
    private final BackOfficeIntegrationSettingRepository integrationSettingRepository;
    private final BackOfficeNotificationPreferenceRepository notificationPreferenceRepository;
    private final BackOfficeSecurityActivityRepository securityActivityRepository;

    @Override
    public BackOfficeSettingPageDto getPage() {
        return BackOfficeSettingPageDto.builder()
                .shopProfile(getShopProfile())
                .socialLinks(getSocialLinks())
                .freeShippingRules(getFreeShippingRules())
                .shippingMethods(getShippingMethods())
                .couriers(getCouriers())
                .teamMembers(getTeamMembers())
                .security(getSecurity())
                .integrations(getIntegrations())
                .notificationPreferences(getNotificationPreferences())
                .build();
    }

    @Override
    public BackOfficeSettingShopProfileDto getShopProfile() {
        return appConfigRepository.findTopByOrderByIdAsc()
                .map(this::toShopProfileDto)
                .orElseGet(BackOfficeSettingShopProfileDto::new);
    }

    @Override
    @Transactional
    public BackOfficeSettingShopProfileDto updateShopProfile(BackOfficeSettingShopProfileDto dto) {
        BackOfficeAppConfigEntity entity = appConfigRepository.findTopByOrderByIdAsc()
                .orElseGet(BackOfficeAppConfigEntity::new);
        entity.setStoreName(trimToNull(dto != null ? dto.getStoreName() : null));
        entity.setContactEmail(trimToNull(dto != null ? dto.getContactEmail() : null));
        entity.setContactPhone(trimToNull(dto != null ? dto.getContactPhone() : null));
        entity.setCity(trimToNull(dto != null ? dto.getCity() : null));
        entity.setLogoUrl(trimToNull(dto != null ? dto.getLogoUrl() : null));
        entity.setSlogan(trimToNull(dto != null ? dto.getSlogan() : null));
        entity.setActivitySector(trimToNull(dto != null ? dto.getActivitySector() : null));
        BackOfficeAppConfigEntity saved = appConfigRepository.save(entity);
        recordSecurityActivity("SETTING_SHOP_PROFILE_UPDATE", "SUCCESS", "PUT", "/back-office/setting/shop-profile", "Mise a jour profil boutique");
        return toShopProfileDto(saved);
    }

    @Override
    public List<BackOfficeSettingSocialLinkDto> getSocialLinks() {
        return socialLinkRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(this::toSocialLinkDto)
                .toList();
    }

    @Override
    @Transactional
    public BackOfficeSettingSocialLinkDto createSocialLink(BackOfficeSettingSocialLinkDto dto) {
        BackOfficeSocialLinkEntity entity = BackOfficeSocialLinkEntity.builder()
                .id(UUID.randomUUID().toString())
                .platform(trimToNull(dto != null ? dto.getPlatform() : null))
                .url(trimToNull(dto != null ? dto.getUrl() : null))
                .sortOrder(Optional.ofNullable(dto).map(BackOfficeSettingSocialLinkDto::getSortOrder).orElse(0))
                .build();
        BackOfficeSocialLinkEntity saved = socialLinkRepository.save(entity);
        recordSecurityActivity("SETTING_SOCIAL_LINK_CREATE", "SUCCESS", "POST", "/back-office/setting/social-links", "Creation reseau social");
        return toSocialLinkDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingSocialLinkDto updateSocialLink(String id, BackOfficeSettingSocialLinkDto dto) {
        BackOfficeSocialLinkEntity entity = socialLinkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SocialLink", "id", id));
        entity.setPlatform(trimToNull(dto != null ? dto.getPlatform() : null));
        entity.setUrl(trimToNull(dto != null ? dto.getUrl() : null));
        entity.setSortOrder(Optional.ofNullable(dto).map(BackOfficeSettingSocialLinkDto::getSortOrder).orElse(0));
        BackOfficeSocialLinkEntity saved = socialLinkRepository.save(entity);
        recordSecurityActivity("SETTING_SOCIAL_LINK_UPDATE", "SUCCESS", "PUT", "/back-office/setting/social-links/" + id, "Mise a jour reseau social");
        return toSocialLinkDto(saved);
    }

    @Override
    @Transactional
    public void deleteSocialLink(String id) {
        if (!socialLinkRepository.existsById(id)) {
            throw new ResourceNotFoundException("SocialLink", "id", id);
        }
        socialLinkRepository.deleteById(id);
        recordSecurityActivity("SETTING_SOCIAL_LINK_DELETE", "SUCCESS", "DELETE", "/back-office/setting/social-links/" + id, "Suppression reseau social");
    }

    @Override
    public List<BackOfficeSettingFreeShippingRuleDto> getFreeShippingRules() {
        return freeShippingRuleRepository.findAll().stream().map(this::toFreeShippingDto).toList();
    }

    @Override
    @Transactional
    public BackOfficeSettingFreeShippingRuleDto createFreeShippingRule(BackOfficeSettingFreeShippingRuleDto dto) {
        BackOfficeFreeShippingRuleEntity entity = BackOfficeFreeShippingRuleEntity.builder()
                .id(UUID.randomUUID().toString())
                .thresholdAmount(Optional.ofNullable(dto).map(BackOfficeSettingFreeShippingRuleDto::getThresholdAmount).orElse(0D))
                .progressMessageTemplate(trimToNull(dto != null ? dto.getProgressMessageTemplate() : null))
                .unlockedMessage(trimToNull(dto != null ? dto.getUnlockedMessage() : null))
                .enabled(Boolean.TRUE.equals(dto != null ? dto.getEnabled() : null))
                .build();
        BackOfficeFreeShippingRuleEntity saved = freeShippingRuleRepository.save(entity);
        recordSecurityActivity("SETTING_FREE_SHIPPING_CREATE", "SUCCESS", "POST", "/back-office/setting/free-shipping-rules", "Creation regle livraison gratuite");
        return toFreeShippingDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingFreeShippingRuleDto updateFreeShippingRule(String id, BackOfficeSettingFreeShippingRuleDto dto) {
        BackOfficeFreeShippingRuleEntity entity = freeShippingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        entity.setThresholdAmount(Optional.ofNullable(dto).map(BackOfficeSettingFreeShippingRuleDto::getThresholdAmount).orElse(0D));
        entity.setProgressMessageTemplate(trimToNull(dto != null ? dto.getProgressMessageTemplate() : null));
        entity.setUnlockedMessage(trimToNull(dto != null ? dto.getUnlockedMessage() : null));
        entity.setEnabled(Boolean.TRUE.equals(dto != null ? dto.getEnabled() : null));
        BackOfficeFreeShippingRuleEntity saved = freeShippingRuleRepository.save(entity);
        recordSecurityActivity("SETTING_FREE_SHIPPING_UPDATE", "SUCCESS", "PUT", "/back-office/setting/free-shipping-rules/" + id, "Mise a jour regle livraison gratuite");
        return toFreeShippingDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingFreeShippingRuleDto enableFreeShippingRule(String id) {
        BackOfficeFreeShippingRuleEntity entity = freeShippingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        entity.setEnabled(Boolean.TRUE);
        BackOfficeFreeShippingRuleEntity saved = freeShippingRuleRepository.save(entity);
        recordSecurityActivity("SETTING_FREE_SHIPPING_ENABLE", "SUCCESS", "POST", "/back-office/setting/free-shipping-rules/" + id + "/enable", "Activation regle livraison gratuite");
        return toFreeShippingDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingFreeShippingRuleDto disableFreeShippingRule(String id) {
        BackOfficeFreeShippingRuleEntity entity = freeShippingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        entity.setEnabled(Boolean.FALSE);
        BackOfficeFreeShippingRuleEntity saved = freeShippingRuleRepository.save(entity);
        recordSecurityActivity("SETTING_FREE_SHIPPING_DISABLE", "SUCCESS", "POST", "/back-office/setting/free-shipping-rules/" + id + "/disable", "Desactivation regle livraison gratuite");
        return toFreeShippingDto(saved);
    }

    @Override
    @Transactional
    public void deleteFreeShippingRule(String id) {
        if (!freeShippingRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("FreeShippingRule", "id", id);
        }
        freeShippingRuleRepository.deleteById(id);
        recordSecurityActivity("SETTING_FREE_SHIPPING_DELETE", "SUCCESS", "DELETE", "/back-office/setting/free-shipping-rules/" + id, "Suppression regle livraison gratuite");
    }

    @Override
    public List<BackOfficeSettingShippingMethodDto> getShippingMethods() {
        return shippingMethodRepository.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(this::toShippingMethodDto)
                .toList();
    }

    @Override
    @Transactional
    public BackOfficeSettingShippingMethodDto createShippingMethod(BackOfficeSettingShippingMethodDto dto) {
        if (Boolean.TRUE.equals(dto != null ? dto.getIsDefault() : null)) {
            unsetDefaultShippingMethods();
        }

        BackOfficeShippingMethodEntity entity = BackOfficeShippingMethodEntity.builder()
                .id(UUID.randomUUID().toString())
                .code(trimToNull(dto != null ? dto.getCode() : null))
                .label(trimToNull(dto != null ? dto.getLabel() : null))
                .description(trimToNull(dto != null ? dto.getDescription() : null))
                .costAmount(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getCostAmount).orElse(0D))
                .enabled(Boolean.TRUE.equals(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getEnabled).orElse(Boolean.TRUE)))
                .isDefault(Boolean.TRUE.equals(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getIsDefault).orElse(Boolean.FALSE)))
                .sortOrder(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getSortOrder).orElse(0))
                .build();
        BackOfficeShippingMethodEntity saved = shippingMethodRepository.save(entity);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_CREATE", "SUCCESS", "POST", "/back-office/setting/shipping-methods", "Creation modalite de livraison");
        return toShippingMethodDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingShippingMethodDto updateShippingMethod(String id, BackOfficeSettingShippingMethodDto dto) {
        BackOfficeShippingMethodEntity entity = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));

        entity.setCode(trimToNull(dto != null ? dto.getCode() : null));
        entity.setLabel(trimToNull(dto != null ? dto.getLabel() : null));
        entity.setDescription(trimToNull(dto != null ? dto.getDescription() : null));
        entity.setCostAmount(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getCostAmount).orElse(0D));
        entity.setEnabled(Boolean.TRUE.equals(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getEnabled).orElse(Boolean.TRUE)));
        entity.setSortOrder(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getSortOrder).orElse(0));

        boolean makeDefault = Boolean.TRUE.equals(Optional.ofNullable(dto).map(BackOfficeSettingShippingMethodDto::getIsDefault).orElse(Boolean.FALSE));
        if (makeDefault) {
            unsetDefaultShippingMethods();
        }
        entity.setIsDefault(makeDefault);

        BackOfficeShippingMethodEntity saved = shippingMethodRepository.save(entity);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_UPDATE", "SUCCESS", "PUT", "/back-office/setting/shipping-methods/" + id, "Mise a jour modalite de livraison");
        return toShippingMethodDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingShippingMethodDto enableShippingMethod(String id) {
        BackOfficeShippingMethodEntity entity = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        entity.setEnabled(Boolean.TRUE);
        BackOfficeShippingMethodEntity saved = shippingMethodRepository.save(entity);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_ENABLE", "SUCCESS", "POST", "/back-office/setting/shipping-methods/" + id + "/enable", "Activation modalite de livraison");
        return toShippingMethodDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingShippingMethodDto disableShippingMethod(String id) {
        BackOfficeShippingMethodEntity entity = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        entity.setEnabled(Boolean.FALSE);
        BackOfficeShippingMethodEntity saved = shippingMethodRepository.save(entity);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_DISABLE", "SUCCESS", "POST", "/back-office/setting/shipping-methods/" + id + "/disable", "Desactivation modalite de livraison");
        return toShippingMethodDto(saved);
    }

    @Override
    @Transactional
    public BackOfficeSettingShippingMethodDto setDefaultShippingMethod(String id) {
        BackOfficeShippingMethodEntity entity = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        unsetDefaultShippingMethods();
        entity.setIsDefault(Boolean.TRUE);
        BackOfficeShippingMethodEntity saved = shippingMethodRepository.save(entity);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_DEFAULT", "SUCCESS", "POST", "/back-office/setting/shipping-methods/" + id + "/default", "Definition modalite de livraison par defaut");
        return toShippingMethodDto(saved);
    }

    @Override
    @Transactional
    public void deleteShippingMethod(String id) {
        if (!shippingMethodRepository.existsById(id)) {
            throw new ResourceNotFoundException("ShippingMethod", "id", id);
        }
        shippingMethodRepository.deleteById(id);
        recordSecurityActivity("SETTING_SHIPPING_METHOD_DELETE", "SUCCESS", "DELETE", "/back-office/setting/shipping-methods/" + id, "Suppression modalite de livraison");
    }

    @Override
    public List<BackOfficeUserDto> getCouriers() {
        return backOfficeUserService.getAll(PageRequest.of(0, SETTINGS_USERS_FETCH_SIZE), "LIVREUR", "").getContent();
    }

    @Override
    @Transactional
    public BackOfficeUserDto createCourier(BackOfficeUserDto dto) {
        BackOfficeUserDto payload = buildUserPayload(dto, "LIVREUR");
        BackOfficeUserDto created = backOfficeUserService.create(payload);
        recordSecurityActivity("SETTING_COURIER_CREATE", "SUCCESS", "POST", "/back-office/setting/couriers", "Creation livreur");
        return created;
    }

    @Override
    @Transactional
    public BackOfficeUserDto updateCourier(String id, BackOfficeUserDto dto) {
        BackOfficeUserDto payload = buildUserPayload(dto, "LIVREUR");
        BackOfficeUserDto updated = backOfficeUserService.update(id, payload);
        recordSecurityActivity("SETTING_COURIER_UPDATE", "SUCCESS", "PUT", "/back-office/setting/couriers/" + id, "Mise a jour livreur");
        return updated;
    }

    @Override
    @Transactional
    public void deleteCourier(String id) {
        backOfficeUserService.delete(id);
        recordSecurityActivity("SETTING_COURIER_DELETE", "SUCCESS", "DELETE", "/back-office/setting/couriers/" + id, "Suppression livreur");
    }

    @Override
    public List<BackOfficeUserDto> getTeamMembers() {
        List<BackOfficeUserDto> admins = backOfficeUserService.getAll(PageRequest.of(0, SETTINGS_USERS_FETCH_SIZE), "ADMIN", "").getContent();
        List<BackOfficeUserDto> superAdmins = backOfficeUserService.getAll(PageRequest.of(0, SETTINGS_USERS_FETCH_SIZE), "SUPER_ADMIN", "").getContent();

        Map<String, BackOfficeUserDto> deduplicated = new LinkedHashMap<>();
        for (BackOfficeUserDto user : admins) {
            if (user != null && user.getId() != null) {
                deduplicated.put(user.getId(), user);
            }
        }
        for (BackOfficeUserDto user : superAdmins) {
            if (user != null && user.getId() != null) {
                deduplicated.put(user.getId(), user);
            }
        }

        List<BackOfficeUserDto> merged = new ArrayList<>(deduplicated.values());
        merged.sort((a, b) -> {
            String roleA = Optional.ofNullable(a.getRole()).orElse("");
            String roleB = Optional.ofNullable(b.getRole()).orElse("");
            int roleCompare = roleA.compareTo(roleB);
            if (roleCompare != 0) {
                return roleCompare;
            }
            String fullNameA = (Optional.ofNullable(a.getPrenom()).orElse("") + " " + Optional.ofNullable(a.getNom()).orElse(""))
                    .trim()
                    .toLowerCase();
            String fullNameB = (Optional.ofNullable(b.getPrenom()).orElse("") + " " + Optional.ofNullable(b.getNom()).orElse(""))
                    .trim()
                    .toLowerCase();
            return fullNameA.compareTo(fullNameB);
        });

        return merged;
    }

    @Override
    @Transactional
    public BackOfficeUserDto createTeamMember(BackOfficeUserDto dto) {
        String role = normalizeTeamRole(dto != null ? dto.getRole() : null);
        BackOfficeUserDto payload = buildUserPayload(dto, role);
        BackOfficeUserDto created = backOfficeUserService.create(payload);
        recordSecurityActivity("SETTING_TEAM_MEMBER_CREATE", "SUCCESS", "POST", "/back-office/setting/team-members", "Creation membre equipe");
        return created;
    }

    @Override
    @Transactional
    public BackOfficeUserDto updateTeamMember(String id, BackOfficeUserDto dto) {
        String role = normalizeTeamRole(dto != null ? dto.getRole() : null);
        BackOfficeUserDto payload = buildUserPayload(dto, role);
        BackOfficeUserDto updated = backOfficeUserService.update(id, payload);
        recordSecurityActivity("SETTING_TEAM_MEMBER_UPDATE", "SUCCESS", "PUT", "/back-office/setting/team-members/" + id, "Mise a jour membre equipe");
        return updated;
    }

    @Override
    @Transactional
    public void deleteTeamMember(String id) {
        backOfficeUserService.delete(id);
        recordSecurityActivity("SETTING_TEAM_MEMBER_DELETE", "SUCCESS", "DELETE", "/back-office/setting/team-members/" + id, "Suppression membre equipe");
    }

    @Override
    public BackOfficeSettingSecurityDto getSecurity() {
        return securitySettingRepository.findTopByOrderByIdAsc()
                .map(this::toSecurityDto)
                .orElseGet(BackOfficeSettingSecurityDto::new);
    }

    @Override
    @Transactional
    public BackOfficeSettingSecurityDto updateSecurity(BackOfficeSettingSecurityDto dto) {
        BackOfficeSecuritySettingEntity entity = securitySettingRepository.findTopByOrderByIdAsc()
                .orElseGet(BackOfficeSecuritySettingEntity::new);
        entity.setAdmin2faEnabled(Boolean.TRUE.equals(dto != null ? dto.getAdmin2faEnabled() : null));
        BackOfficeSecuritySettingEntity saved = securitySettingRepository.save(entity);
        recordSecurityActivity("SETTING_SECURITY_UPDATE", "SUCCESS", "PUT", "/back-office/setting/security", "Mise a jour securite");
        return toSecurityDto(saved);
    }

    @Override
    public byte[] exportSecurityActivityCsv(int size) {
        int safeSize = Math.max(0, Math.min(size, 5000));
        List<BackOfficeSecurityActivityEntity> rows = securityActivityRepository
                .findAllByOrderByEventAtDesc(PageRequest.of(0, safeSize))
                .getContent();

        StringBuilder csv = new StringBuilder("timestamp,userId,action,status,ip\n");
        for (BackOfficeSecurityActivityEntity row : rows) {
            csv.append(csvCell(row.getEventAt() == null ? "" : row.getEventAt().toString())).append(",")
                    .append(csvCell(row.getUserId())).append(",")
                    .append(csvCell(row.getAction())).append(",")
                    .append(csvCell(row.getStatus())).append(",")
                    .append(csvCell(row.getIp()))
                    .append("\n");
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public BackOfficeSettingIntegrationsDto getIntegrations() {
        return integrationSettingRepository.findTopByOrderByIdAsc()
                .map(this::toIntegrationsDto)
                .orElseGet(BackOfficeSettingIntegrationsDto::new);
    }

    @Override
    @Transactional
    public BackOfficeSettingIntegrationsDto updateIntegrations(BackOfficeSettingIntegrationsUpdateDto dto) {
        BackOfficeIntegrationSettingEntity entity = integrationSettingRepository.findTopByOrderByIdAsc()
                .orElseGet(BackOfficeIntegrationSettingEntity::new);

        if (Boolean.TRUE.equals(dto != null ? dto.getPaydunyaDisconnect() : null)) {
            entity.setPaydunyaConnected(Boolean.FALSE);
            entity.setPaydunyaPublicKey(null);
            entity.setPaydunyaPrivateKey(null);
            entity.setPaydunyaMasterKey(null);
            entity.setPaydunyaToken(null);
        } else {
            if (dto != null && trimToNull(dto.getPaydunyaMode()) != null) {
                entity.setPaydunyaMode(trimToNull(dto.getPaydunyaMode()));
            }
            if (dto != null && trimToNull(dto.getPaydunyaPublicKey()) != null) {
                entity.setPaydunyaPublicKey(trimToNull(dto.getPaydunyaPublicKey()));
            }
            if (dto != null && trimToNull(dto.getPaydunyaPrivateKey()) != null) {
                entity.setPaydunyaPrivateKey(trimToNull(dto.getPaydunyaPrivateKey()));
            }
            if (dto != null && trimToNull(dto.getPaydunyaMasterKey()) != null) {
                entity.setPaydunyaMasterKey(trimToNull(dto.getPaydunyaMasterKey()));
            }
            if (dto != null && trimToNull(dto.getPaydunyaToken()) != null) {
                entity.setPaydunyaToken(trimToNull(dto.getPaydunyaToken()));
            }
            if (dto != null && (
                    trimToNull(dto.getPaydunyaPublicKey()) != null
                            || trimToNull(dto.getPaydunyaPrivateKey()) != null
                            || trimToNull(dto.getPaydunyaMasterKey()) != null
                            || trimToNull(dto.getPaydunyaToken()) != null
            )) {
                entity.setPaydunyaConnected(Boolean.TRUE);
            }
        }

        if (Boolean.TRUE.equals(dto != null ? dto.getSendinblueDisconnect() : null)) {
            entity.setSendinblueConnected(Boolean.FALSE);
            entity.setSendinblueApiKey(null);
        } else if (dto != null && trimToNull(dto.getSendinblueApiKey()) != null) {
            entity.setSendinblueApiKey(trimToNull(dto.getSendinblueApiKey()));
            entity.setSendinblueConnected(Boolean.TRUE);
        }

        if (Boolean.TRUE.equals(dto != null ? dto.getSlackDisconnect() : null)) {
            entity.setSlackConnected(Boolean.FALSE);
            entity.setSlackWebhookUrl(null);
        } else if (dto != null && trimToNull(dto.getSlackWebhookUrl()) != null) {
            entity.setSlackWebhookUrl(trimToNull(dto.getSlackWebhookUrl()));
            entity.setSlackConnected(Boolean.TRUE);
        }

        if (Boolean.TRUE.equals(dto != null ? dto.getGoogleAnalyticsDisconnect() : null)) {
            entity.setGoogleAnalyticsConnected(Boolean.FALSE);
            entity.setGoogleAnalyticsMeasurementId(null);
        } else if (dto != null && trimToNull(dto.getGoogleAnalyticsMeasurementId()) != null) {
            entity.setGoogleAnalyticsMeasurementId(trimToNull(dto.getGoogleAnalyticsMeasurementId()));
            entity.setGoogleAnalyticsConnected(Boolean.TRUE);
        }

        BackOfficeIntegrationSettingEntity saved = integrationSettingRepository.save(entity);
        recordSecurityActivity("SETTING_INTEGRATIONS_UPDATE", "SUCCESS", "PUT", "/back-office/setting/integrations", "Mise a jour integrations");
        return toIntegrationsDto(saved);
    }

    @Override
    public List<BackOfficeSettingNotificationPreferenceDto> getNotificationPreferences() {
        return notificationPreferenceRepository.findAll().stream()
                .map(this::toNotificationPreferenceDto)
                .toList();
    }

    @Override
    @Transactional
    public List<BackOfficeSettingNotificationPreferenceDto> updateNotificationPreferences(
            BackOfficeSettingNotificationPreferencesUpdateDto dto
    ) {
        notificationPreferenceRepository.deleteAllInBatch();
        List<BackOfficeNotificationPreferenceEntity> toSave = new ArrayList<>();
        List<BackOfficeSettingNotificationPreferencesUpdateDto.Item> items = dto != null ? dto.getItems() : null;
        if (items != null) {
            for (BackOfficeSettingNotificationPreferencesUpdateDto.Item item : items) {
                if (item == null || trimToEmpty(item.getKey()).isBlank()) {
                    continue;
                }
                toSave.add(BackOfficeNotificationPreferenceEntity.builder()
                        .key(trimToEmpty(item.getKey()))
                        .label(trimToNull(item.getLabel()))
                        .enabled(Boolean.TRUE.equals(item.getEnabled()))
                        .build());
            }
        }
        if (!toSave.isEmpty()) {
            notificationPreferenceRepository.saveAll(toSave);
        }
        recordSecurityActivity("SETTING_NOTIFICATION_PREFERENCES_UPDATE", "SUCCESS", "PUT", "/back-office/setting/notification-preferences", "Mise a jour preferences notifications");
        return getNotificationPreferences();
    }

    private void unsetDefaultShippingMethods() {
        List<BackOfficeShippingMethodEntity> methods = shippingMethodRepository.findAll();
        for (BackOfficeShippingMethodEntity method : methods) {
            if (Boolean.TRUE.equals(method.getIsDefault())) {
                method.setIsDefault(Boolean.FALSE);
            }
        }
        shippingMethodRepository.saveAll(methods);
    }

    private BackOfficeUserDto buildUserPayload(BackOfficeUserDto input, String role) {
        return BackOfficeUserDto.builder()
                .id(input != null ? input.getId() : null)
                .prenom(input != null ? input.getPrenom() : null)
                .nom(input != null ? input.getNom() : null)
                .email(input != null ? input.getEmail() : null)
                .telephone(input != null ? input.getTelephone() : null)
                .emailVerifie(Boolean.TRUE)
                .role(role)
                .avatarUrl(input != null ? input.getAvatarUrl() : null)
                .ville(input != null ? input.getVille() : null)
                .pays(input != null ? input.getPays() : null)
                .build();
    }

    private String normalizeTeamRole(String rawRole) {
        String role = trimToEmpty(rawRole).toUpperCase(Locale.ROOT);
        if (role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le role est obligatoire.");
        }

        try {
            UserRole parsed = UserRole.valueOf(role);
            if (parsed == UserRole.CUSTOMER || parsed == UserRole.PARTNER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role non autorise pour un membre d'equipe: " + role);
            }
            return parsed.name();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role invalide: " + role);
        }
    }

    private void recordSecurityActivity(String action, String status, String method, String path, String summary) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        String ip = resolveRequestIp();

        BackOfficeSecurityActivityEntity entity = BackOfficeSecurityActivityEntity.builder()
                .eventAt(LocalDateTime.now())
                .userId(trimToNull(currentUserId))
                .action(action)
                .status(status)
                .ip(trimToNull(ip))
                .method(trimToNull(method))
                .path(trimToNull(path))
                .summary(trimToNull(summary))
                .build();

        securityActivityRepository.save(entity);
    }

    private String resolveRequestIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return null;
            }
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception ex) {
            return null;
        }
    }

    private String csvCell(String value) {
        String safe = value == null ? "" : value;
        if (safe.contains(",") || safe.contains("\"") || safe.contains("\n")) {
            return "\"" + safe.replace("\"", "\"\"") + "\"";
        }
        return safe;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimToNull(String value) {
        String trimmed = trimToEmpty(value);
        return trimmed.isBlank() ? null : trimmed;
    }

    private BackOfficeSettingShopProfileDto toShopProfileDto(BackOfficeAppConfigEntity entity) {
        return BackOfficeSettingShopProfileDto.builder()
                .storeName(entity.getStoreName())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .city(entity.getCity())
                .logoUrl(entity.getLogoUrl())
                .slogan(entity.getSlogan())
                .activitySector(entity.getActivitySector())
                .build();
    }

    private BackOfficeSettingSocialLinkDto toSocialLinkDto(BackOfficeSocialLinkEntity entity) {
        return BackOfficeSettingSocialLinkDto.builder()
                .id(entity.getId())
                .platform(entity.getPlatform())
                .url(entity.getUrl())
                .sortOrder(entity.getSortOrder())
                .build();
    }

    private BackOfficeSettingFreeShippingRuleDto toFreeShippingDto(BackOfficeFreeShippingRuleEntity entity) {
        return BackOfficeSettingFreeShippingRuleDto.builder()
                .id(entity.getId())
                .thresholdAmount(entity.getThresholdAmount())
                .progressMessageTemplate(entity.getProgressMessageTemplate())
                .unlockedMessage(entity.getUnlockedMessage())
                .enabled(entity.getEnabled())
                .build();
    }

    private BackOfficeSettingShippingMethodDto toShippingMethodDto(BackOfficeShippingMethodEntity entity) {
        return BackOfficeSettingShippingMethodDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .label(entity.getLabel())
                .description(entity.getDescription())
                .costAmount(entity.getCostAmount())
                .enabled(entity.getEnabled())
                .isDefault(entity.getIsDefault())
                .sortOrder(entity.getSortOrder())
                .build();
    }

    private BackOfficeSettingSecurityDto toSecurityDto(BackOfficeSecuritySettingEntity entity) {
        return BackOfficeSettingSecurityDto.builder()
                .admin2faEnabled(entity.getAdmin2faEnabled())
                .build();
    }

    private BackOfficeSettingIntegrationsDto toIntegrationsDto(BackOfficeIntegrationSettingEntity entity) {
        return BackOfficeSettingIntegrationsDto.builder()
                .paydunyaConnected(entity.getPaydunyaConnected())
                .paydunyaMode(entity.getPaydunyaMode())
                .paydunyaPublicKey(entity.getPaydunyaPublicKey())
                .sendinblueConnected(entity.getSendinblueConnected())
                .slackConnected(entity.getSlackConnected())
                .googleAnalyticsConnected(entity.getGoogleAnalyticsConnected())
                .googleAnalyticsMeasurementId(entity.getGoogleAnalyticsMeasurementId())
                .build();
    }

    private BackOfficeSettingNotificationPreferenceDto toNotificationPreferenceDto(BackOfficeNotificationPreferenceEntity entity) {
        return BackOfficeSettingNotificationPreferenceDto.builder()
                .key(entity.getKey())
                .label(entity.getLabel())
                .enabled(entity.getEnabled())
                .build();
    }
}
