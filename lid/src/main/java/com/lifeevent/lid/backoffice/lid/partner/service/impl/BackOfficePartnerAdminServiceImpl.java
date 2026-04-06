package com.lifeevent.lid.backoffice.lid.partner.service.impl;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerAdminDto;
import com.lifeevent.lid.backoffice.lid.partner.service.BackOfficePartnerAdminService;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.mapper.BackOfficePartnerMapper;
import com.lifeevent.lid.common.cache.CacheScopeVersionService;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficePartnerAdminServiceImpl implements BackOfficePartnerAdminService {

    private static final int MAX_PAGE_SIZE = 100;

    private final PartnerRepository partnerRepository;
    private final BackOfficePartnerMapper backOfficePartnerMapper;
    private final CacheScopeVersionService cacheScopeVersionService;

    @Override
    public PageResponse<BackOfficePartnerAdminDto> listPartners(int page, int size, String q, List<PartnerRegistrationStatus> statuses) {
        PageRequest pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        String query = q == null ? "" : q.trim();
        boolean queryEmpty = query.isBlank();
        String queryPattern = queryEmpty ? "%" : "%" + query.toLowerCase() + "%";
        List<PartnerRegistrationStatus> safeStatuses = statuses == null
                ? List.of()
                : statuses.stream().filter(Objects::nonNull).distinct().toList();
        boolean statusEmpty = safeStatuses.isEmpty();

        Page<Partner> partners = partnerRepository.searchBackofficePartners(
                safeStatuses,
                statusEmpty,
                queryPattern,
                queryEmpty,
                pageable
        );
        return PageResponse.from(partners.map(this::toAdminDto));
    }

    @Override
    public BackOfficePartnerSettingsDto getPartner(String partnerId) {
        return backOfficePartnerMapper.toSettingsDto(requirePartner(partnerId));
    }

    @Override
    @Transactional
    public BackOfficePartnerSettingsDto approvePartner(String partnerId) {
        return updateRegistrationStatus(partnerId, PartnerRegistrationStatus.VERIFIED, null);
    }

    @Override
    @Transactional
    public BackOfficePartnerSettingsDto rejectPartner(String partnerId, String comment) {
        return updateRegistrationStatus(partnerId, PartnerRegistrationStatus.REJECTED, normalizeComment(comment));
    }

    private BackOfficePartnerSettingsDto updateRegistrationStatus(
            String partnerId,
            PartnerRegistrationStatus targetStatus,
            String reviewComment
    ) {
        Partner partner = requirePartner(partnerId);
        boolean statusChanged = partner.getRegistrationStatus() != targetStatus;
        boolean commentChanged = !Objects.equals(partner.getRegistrationReviewComment(), reviewComment);
        if (statusChanged || commentChanged) {
            partner.setRegistrationStatus(targetStatus);
            partner.setRegistrationReviewComment(reviewComment);
            partner = partnerRepository.save(partner);
            touchPartnerCaches(partner.getUserId());
        }
        return backOfficePartnerMapper.toSettingsDto(partner);
    }

    private Partner requirePartner(String partnerId) {
        String normalizedPartnerId = partnerId == null ? null : partnerId.trim();
        if (normalizedPartnerId == null || normalizedPartnerId.isEmpty()) {
            throw new IllegalArgumentException("partnerId manquant");
        }
        return partnerRepository.findById(normalizedPartnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "partnerId", normalizedPartnerId));
    }

    private BackOfficePartnerAdminDto toAdminDto(Partner partner) {
        if (partner == null) {
            return null;
        }
        var shop = partner.getShop();
        var mainCategory = shop == null ? null : shop.getMainCategory();
        return new BackOfficePartnerAdminDto(
                partner.getUserId(),
                partner.getFirstName(),
                partner.getLastName(),
                partner.getEmail(),
                partner.getPhoneNumber(),
                shop == null ? null : shop.getShopId(),
                shop == null ? null : shop.getShopName(),
                mainCategory == null ? null : mainCategory.getId(),
                mainCategory == null ? null : mainCategory.getName(),
                partner.getRegistrationStatus(),
                partner.getContractAccepted(),
                partner.getCreatedAt(),
                partner.getUpdatedAt()
        );
    }

    private void touchPartnerCaches(String partnerId) {
        cacheScopeVersionService.bumpPartner(partnerId);
        cacheScopeVersionService.bumpCatalog();
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int safePage(int page) {
        return Math.max(0, page);
    }

    private int safeSize(int size) {
        return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
    }
}
