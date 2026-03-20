package com.lifeevent.lid.backoffice.partner.preference.service.impl;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import com.lifeevent.lid.backoffice.partner.preference.entity.PartnerPreferences;
import com.lifeevent.lid.backoffice.partner.preference.repository.PartnerPreferencesRepository;
import com.lifeevent.lid.backoffice.partner.preference.service.PartnerPreferencesService;
import com.lifeevent.lid.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@Transactional
@RequiredArgsConstructor
public class PartnerPreferencesServiceImpl implements PartnerPreferencesService {

    private final PartnerPreferencesRepository repository;

    @Override
    @Transactional(readOnly = true)
    public PartnerPreferencesDto getMine() {
        String partnerId = requireCurrentPartnerId();
        PartnerPreferences entity = repository.findById(partnerId).orElse(null);
        if (entity == null) {
            return new PartnerPreferencesDto(5, "", "", "", "{}");
        }
        return toDto(entity);
    }

    @Override
    public PartnerPreferencesDto updateMine(PartnerPreferencesDto dto) {
        String partnerId = requireCurrentPartnerId();
        PartnerPreferences entity = repository.findById(partnerId)
                .orElseGet(() -> PartnerPreferences.builder().partnerId(partnerId).build());

        entity.setStockThreshold(dto == null ? entity.getStockThreshold() : dto.stockThreshold());
        entity.setWebsiteUrl(dto == null ? entity.getWebsiteUrl() : normalizeOrNull(dto.websiteUrl()));
        entity.setInstagramHandle(dto == null ? entity.getInstagramHandle() : normalizeOrNull(dto.instagramHandle()));
        entity.setFacebookPage(dto == null ? entity.getFacebookPage() : normalizeOrNull(dto.facebookPage()));
        entity.setOpeningHoursJson(dto == null ? entity.getOpeningHoursJson() : normalizeOrNull(dto.openingHoursJson()));

        PartnerPreferences saved = repository.save(entity);
        return toDto(saved);
    }

    private PartnerPreferencesDto toDto(PartnerPreferences entity) {
        return new PartnerPreferencesDto(
                entity.getStockThreshold(),
                entity.getWebsiteUrl(),
                entity.getInstagramHandle(),
                entity.getFacebookPage(),
                entity.getOpeningHoursJson()
        );
    }

    private String normalizeOrNull(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }
}

