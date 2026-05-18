package com.lifeevent.lid.backoffice.lid.partner.service.impl;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerAdminDto;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerPaymentSettingsDto;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.backoffice.lid.partner.entity.PartnerPaymentSettings;
import com.lifeevent.lid.backoffice.lid.partner.repository.PartnerPaymentSettingsRepository;
import com.lifeevent.lid.backoffice.lid.partner.service.BackOfficePartnerAdminService;
import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeAppConfigEntity;
import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeAppConfigRepository;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.mapper.BackOfficePartnerMapper;
import com.lifeevent.lid.common.cache.CacheScopeVersionService;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.payment.partner.service.PartnerSettlementService;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class BackOfficePartnerAdminServiceImpl implements BackOfficePartnerAdminService {

    private static final int MAX_PAGE_SIZE = 100;

    private final PartnerRepository partnerRepository;
    private final BackOfficePartnerMapper backOfficePartnerMapper;
    private final CacheScopeVersionService cacheScopeVersionService;
    private final PartnerSettlementService partnerSettlementService;
    private final PartnerPaymentSettingsRepository partnerPaymentSettingsRepository;
    private final BackOfficeAppConfigRepository appConfigRepository;

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

    @Override
    public BackOfficePartnerPaymentSettingsDto getPartnerPaymentSettings(String partnerId) {
        Partner partner = requirePartner(partnerId);
        BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc().orElse(null);
        PartnerPaymentSettings settings = partnerPaymentSettingsRepository.findByPartnerId(partner.getUserId()).orElse(null);
        return toPaymentSettingsDto(partner.getUserId(), settings, config);
    }

    @Override
    @Transactional
    public BackOfficePartnerPaymentSettingsDto updatePartnerPaymentSettings(
            String partnerId,
            BackOfficePartnerPaymentSettingsDto request
    ) {
        Partner partner = requirePartner(partnerId);
        BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc().orElse(null);
        PartnerPaymentSettings settings = partnerPaymentSettingsRepository.findByPartnerId(partner.getUserId())
                .orElseGet(() -> PartnerPaymentSettings.builder().partnerId(partner.getUserId()).build());
        settings.setSettlementMode(normalizeSettlementMode(request == null ? null : request.settlementMode(), config));
        settings.setMarginPercent(normalizeMarginPercent(request == null ? null : request.marginPercent(), config));
        String payoutWithdrawMode = normalizePayoutWithdrawMode(request == null ? null : request.payoutWithdrawMode());
        settings.setPayoutWithdrawMode(payoutWithdrawMode);
        settings.setPayoutEnabled(Boolean.TRUE.equals(request == null ? null : request.payoutEnabled()) && payoutWithdrawMode != null);
        PartnerPaymentSettings saved = partnerPaymentSettingsRepository.save(settings);
        return toPaymentSettingsDto(partner.getUserId(), saved, config);
    }

    @Override
    @Transactional
    public PageResponse<BackOfficePartnerTransactionDto> getPartnerTransactions(String partnerId, LocalDate fromDate, LocalDate toDate, int page, int size) {
        requirePartner(partnerId);
        return partnerSettlementService.listPartnerTransactions(partnerId, fromDate, toDate, page, size);
    }

    @Override
    @Transactional
    public BackOfficePartnerTransactionDto payPartnerTransactionManual(String partnerId, Long transactionId) {
        requirePartner(partnerId);
        return partnerSettlementService.markSettlementPaidManual(partnerId, transactionId);
    }

    @Override
    @Transactional
    public BackOfficePartnerTransactionDto payPartnerTransactionDirect(String partnerId, Long transactionId) {
        requirePartner(partnerId);
        return partnerSettlementService.paySettlementDirect(partnerId, transactionId);
    }

    @Override
    @Transactional
    public BackOfficePartnerTransactionDto schedulePartnerTransaction(String partnerId, Long transactionId, LocalDateTime scheduledAt) {
        requirePartner(partnerId);
        return partnerSettlementService.scheduleSettlement(partnerId, transactionId, scheduledAt);
    }

    @Override
    @Transactional
    public BackOfficePartnerTransactionDto cancelPartnerTransaction(String partnerId, Long transactionId) {
        requirePartner(partnerId);
        return partnerSettlementService.cancelSettlement(partnerId, transactionId);
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

    private BackOfficePartnerPaymentSettingsDto toPaymentSettingsDto(
            String partnerId,
            PartnerPaymentSettings settings,
            BackOfficeAppConfigEntity config
    ) {
        return new BackOfficePartnerPaymentSettingsDto(
                partnerId,
                normalizeSettlementMode(settings == null ? null : settings.getSettlementMode(), config),
                normalizeMarginPercent(settings == null ? null : settings.getMarginPercent(), config),
                normalizePayoutWithdrawMode(settings == null ? null : settings.getPayoutWithdrawMode(), config),
                settings == null
                        ? normalizePayoutWithdrawMode(config == null ? null : config.getPartnerPayoutWithdrawMode()) != null
                        : Boolean.TRUE.equals(settings.getPayoutEnabled())
                        && normalizePayoutWithdrawMode(settings.getPayoutWithdrawMode()) != null
        );
    }

    private PartnerSettlementMode normalizeSettlementMode(PartnerSettlementMode raw, BackOfficeAppConfigEntity config) {
        if (raw != null) {
            return raw;
        }
        return config != null && config.getPartnerSettlementMode() != null
                ? config.getPartnerSettlementMode()
                : PartnerSettlementMode.DEDUCT_SHIPPING_AND_RETURN_COST;
    }

    private Double normalizeMarginPercent(Double raw, BackOfficeAppConfigEntity config) {
        Double source = raw != null ? raw : config == null ? null : config.getPartnerMarginPercent();
        if (source == null || !Double.isFinite(source) || source < 0d) {
            return 0d;
        }
        return source;
    }

    private String normalizePayoutWithdrawMode(String raw, BackOfficeAppConfigEntity config) {
        String normalized = normalizePayoutWithdrawMode(raw);
        if (normalized != null) {
            return normalized;
        }
        return normalizePayoutWithdrawMode(config == null ? null : config.getPartnerPayoutWithdrawMode());
    }

    private String normalizePayoutWithdrawMode(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private int safePage(int page) {
        return Math.max(0, page);
    }

    private int safeSize(int size) {
        return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
    }
}
