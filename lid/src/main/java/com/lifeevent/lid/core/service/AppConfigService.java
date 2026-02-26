package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.AppConfigDto;
import com.lifeevent.lid.core.dto.FreeShippingConfigDto;
import com.lifeevent.lid.core.dto.SocialLinkDto;
import com.lifeevent.lid.core.dto.ShippingMethodDto;
import com.lifeevent.lid.core.dto.UpdateAppConfigRequest;
import com.lifeevent.lid.core.entity.AppSocialLink;
import com.lifeevent.lid.core.entity.AppConfig;
import com.lifeevent.lid.core.entity.FreeShippingRule;
import com.lifeevent.lid.core.entity.ShippingMethod;
import com.lifeevent.lid.core.enums.ActivitySector;
import com.lifeevent.lid.core.repository.AppConfigRepository;
import com.lifeevent.lid.core.repository.AppSocialLinkRepository;
import com.lifeevent.lid.core.repository.FreeShippingRuleRepository;
import com.lifeevent.lid.core.repository.ShippingMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppConfigService {

    private static final String DEFAULT_ID = "default";

    private final AppConfigRepository repository;
    private final AppSocialLinkRepository socialLinkRepository;
    private final FreeShippingRuleRepository freeShippingRuleRepository;
    private final ShippingMethodRepository shippingMethodRepository;

    public AppConfigService(
            AppConfigRepository repository,
            AppSocialLinkRepository socialLinkRepository,
            FreeShippingRuleRepository freeShippingRuleRepository,
            ShippingMethodRepository shippingMethodRepository
    ) {
        this.repository = repository;
        this.socialLinkRepository = socialLinkRepository;
        this.freeShippingRuleRepository = freeShippingRuleRepository;
        this.shippingMethodRepository = shippingMethodRepository;
    }

    @Transactional
    public AppConfigDto getPublic() {
        AppConfig cfg = getOrCreate();
        return toDtoWithSocialLinks(cfg);
    }

    @Transactional
    public AppConfigDto getBackoffice() {
        AppConfig cfg = getOrCreate();
        return toDtoWithSocialLinks(cfg);
    }

    @Transactional
    public AppConfigDto update(UpdateAppConfigRequest request) {
        AppConfig cfg = getOrCreate();
        cfg.setStoreName(request.storeName().trim());
        cfg.setContactEmail(request.contactEmail().trim().toLowerCase());
        cfg.setContactPhone(request.contactPhone().trim());
        cfg.setCity(request.city().trim());
        if (request.logoUrl() != null) {
            String v = request.logoUrl().trim();
            cfg.setLogoUrl(v.isEmpty() ? null : v);
        }
        if (request.slogan() != null) {
            String v = request.slogan().trim();
            cfg.setSlogan(v.isEmpty() ? null : v);
        }
        if (request.activitySector() != null) {
            String raw = request.activitySector().trim();
            if (raw.isEmpty()) {
                cfg.setActivitySector(null);
            } else {
                cfg.setActivitySector(ActivitySector.valueOf(raw.toUpperCase()));
            }
        }
        cfg.setUpdatedAt(LocalDateTime.now());
        AppConfig saved = repository.save(cfg);
        return toDtoWithSocialLinks(saved);
    }

    private AppConfig getOrCreate() {
        AppConfig cfg = repository.findById(DEFAULT_ID).orElseGet(() -> {
            AppConfig created = new AppConfig();
            created.setId(DEFAULT_ID);
            created.setStoreName("LID Prime Store");
            created.setContactEmail("contact@lid.store");
            created.setContactPhone("+225 07 00 00 00 00");
            created.setCity("Abidjan");
            created.setUpdatedAt(LocalDateTime.now());
            return repository.save(created);
        });

        boolean changed = false;
        if (cfg.getContactPhone() == null || cfg.getContactPhone().isBlank()) {
            cfg.setContactPhone("+225 07 00 00 00 00");
            changed = true;
        }
        if (changed) {
            cfg.setUpdatedAt(LocalDateTime.now());
            return repository.save(cfg);
        }

        return cfg;
    }

    private AppConfigDto toDtoWithSocialLinks(AppConfig cfg) {
        List<SocialLinkDto> links = socialLinkRepository.findByAppConfigId(cfg.getId()).stream()
                .map(AppConfigService::toDto)
                .toList();

        FreeShippingConfigDto freeShipping = freeShippingRuleRepository
                .findFirstByAppConfigIdAndEnabledTrueOrderByUpdatedAtDesc(cfg.getId())
                .map(AppConfigService::toDto)
                .orElse(null);

        List<ShippingMethodDto> shippingMethods = shippingMethodRepository
                .findByAppConfigIdOrderBySortOrderAscUpdatedAtDesc(cfg.getId())
                .stream()
                .filter((sm) -> Boolean.TRUE.equals(sm.getEnabled()))
                .map(AppConfigService::toDto)
                .toList();

        return new AppConfigDto(
                cfg.getStoreName(),
                cfg.getContactEmail(),
                cfg.getContactPhone(),
                cfg.getCity(),
                cfg.getLogoUrl(),
                cfg.getSlogan(),
                cfg.getActivitySector() == null ? null : cfg.getActivitySector().name(),
                freeShipping,
                shippingMethods,
                links,
                cfg.getUpdatedAt()
        );
    }

    private static SocialLinkDto toDto(AppSocialLink link) {
        return new SocialLinkDto(
                link.getId(),
                link.getPlatform() == null ? null : link.getPlatform().name(),
                link.getUrl(),
                link.getSortOrder()
        );
    }

    private static FreeShippingConfigDto toDto(FreeShippingRule rule) {
        return new FreeShippingConfigDto(
                rule.getId(),
                Boolean.TRUE.equals(rule.getEnabled()),
                rule.getThresholdAmount(),
                rule.getProgressMessageTemplate(),
                rule.getUnlockedMessage()
        );
    }

    private static ShippingMethodDto toDto(ShippingMethod sm) {
        return new ShippingMethodDto(
                sm.getId(),
                sm.getCode(),
                sm.getLabel(),
                sm.getDescription(),
                sm.getCostAmount(),
                Boolean.TRUE.equals(sm.getEnabled()),
                Boolean.TRUE.equals(sm.getIsDefault()),
                sm.getSortOrder(),
                sm.getUpdatedAt()
        );
    }
}
