package com.lifeevent.lid.backoffice.marketing.service.impl;

import com.lifeevent.lid.backoffice.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.backoffice.marketing.dto.MarketingChannelShareDto;
import com.lifeevent.lid.backoffice.marketing.dto.MarketingOverviewDto;
import com.lifeevent.lid.backoffice.marketing.mapper.BackOfficeMarketingCampaignMapper;
import com.lifeevent.lid.backoffice.marketing.service.BackOfficeMarketingService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import com.lifeevent.lid.marketing.enumeration.MarketingAudience;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import com.lifeevent.lid.marketing.repository.MarketingCampaignDeliveryRepository;
import com.lifeevent.lid.marketing.repository.MarketingCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeMarketingServiceImpl implements BackOfficeMarketingService {

    private final MarketingCampaignRepository marketingCampaignRepository;
    private final MarketingCampaignDeliveryRepository marketingCampaignDeliveryRepository;
    private final BackOfficeMarketingCampaignMapper backOfficeMarketingCampaignMapper;
    private final BackOfficeMarketingAutomationService backOfficeMarketingAutomationService;

    @Override
    @Transactional(readOnly = true)
    public MarketingOverviewDto getOverview(Integer days) {
        int safeDays = normalizeDays(days);
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        double revenue = safeDouble(marketingCampaignRepository.sumRevenueFrom(from));
        double budget = safeDouble(marketingCampaignRepository.sumBudgetFrom(from));
        double roi = budget > 0d ? revenue / budget : 0d;

        List<MarketingChannelShareDto> channels = buildChannelShares(from);
        return MarketingOverviewDto.builder()
                .roiGlobal(roi)
                .budgetSpent(budget)
                .channels(channels)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeMarketingCampaignDto> getCampaigns(Pageable pageable, MarketingCampaignStatus status) {
        Page<MarketingCampaign> page = status == null
                ? marketingCampaignRepository.findAll(pageable)
                : marketingCampaignRepository.findByStatus(status, pageable);
        return page.map(backOfficeMarketingCampaignMapper::toDto);
    }

    @Override
    public BackOfficeMarketingCampaignDto createCampaign(BackOfficeMarketingCampaignDto dto) {
        MarketingCampaign entity = backOfficeMarketingCampaignMapper.toEntity(dto);
        applyDefaults(entity);
        MarketingCampaign saved = marketingCampaignRepository.save(entity);
        return backOfficeMarketingCampaignMapper.toDto(saved);
    }

    @Override
    public BackOfficeMarketingCampaignDto updateCampaign(Long id, BackOfficeMarketingCampaignDto dto) {
        MarketingCampaign entity = marketingCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketingCampaign", "id", id.toString()));

        MarketingCampaignType oldType = entity.getType();
        MarketingAudience oldAudience = entity.getAudience();

        backOfficeMarketingCampaignMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);

        boolean recipientsChanged = !Objects.equals(oldType, entity.getType())
                || !Objects.equals(oldAudience, entity.getAudience());
        boolean hasProgress = entity.getSentCount() != null && entity.getSentCount() > 0 && entity.getSentAt() == null;
        if (recipientsChanged && hasProgress) {
            throw new IllegalArgumentException("Impossible de changer l'audience/le canal pendant l'envoi");
        }

        MarketingCampaign saved = marketingCampaignRepository.save(entity);

        if (recipientsChanged
                && saved.getSentAt() == null
                && marketingCampaignDeliveryRepository.existsByCampaign_Id(saved.getId())) {
            marketingCampaignDeliveryRepository.deleteByCampaign_Id(saved.getId());
            resetProgress(saved);
            saved = marketingCampaignRepository.save(saved);
        }
        return backOfficeMarketingCampaignMapper.toDto(saved);
    }

    @Override
    public BackOfficeMarketingCampaignDto sendCampaign(Long id) {
        MarketingCampaign saved = backOfficeMarketingAutomationService.queueSendNow(id);
        return backOfficeMarketingCampaignMapper.toDto(saved);
    }

    @Override
    public void deleteCampaign(Long id) {
        ensureCampaignExists(id);
        deleteCampaignDeliveries(id);
        marketingCampaignRepository.deleteById(id);
    }

    private void ensureCampaignExists(Long id) {
        if (!marketingCampaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("MarketingCampaign", "id", id.toString());
        }
    }

    private void deleteCampaignDeliveries(Long campaignId) {
        if (!marketingCampaignDeliveryRepository.existsByCampaign_Id(campaignId)) {
            return;
        }
        marketingCampaignDeliveryRepository.deleteByCampaign_Id(campaignId);
    }

    private void applyDefaults(MarketingCampaign entity) {
        if (entity.getStatus() == null) {
            entity.setStatus(MarketingCampaignStatus.ACTIVE);
        }
        if (entity.getType() == null) {
            entity.setType(MarketingCampaignType.EMAIL);
        }
        if (entity.getAudience() == null) {
            entity.setAudience(MarketingAudience.NEWSLETTER);
        }
        if (entity.getSentCount() == null) {
            entity.setSentCount(0L);
        }
        if (entity.getTargetCount() == null) {
            entity.setTargetCount(0L);
        }
        if (entity.getFailedCount() == null) {
            entity.setFailedCount(0L);
        }
        if (entity.getAttempts() == null) {
            entity.setAttempts(0);
        }
    }

    private void resetProgress(MarketingCampaign campaign) {
        campaign.setTargetCount(0L);
        campaign.setSentCount(0L);
        campaign.setFailedCount(0L);
        campaign.setAttempts(0);
        campaign.setNextRetryAt(null);
        campaign.setLastError(null);
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return 30;
        }
        return Math.max(1, Math.min(days, 365));
    }

    private double safeDouble(Double value) {
        return value == null ? 0d : value;
    }

    private List<MarketingChannelShareDto> buildChannelShares(LocalDateTime from) {
        List<MarketingCampaignRepository.TypeRevenueAgg> byType = marketingCampaignRepository.revenueByTypeFrom(from);
        double totalRevenue = byType.stream()
                .map(MarketingCampaignRepository.TypeRevenueAgg::getRevenue)
                .mapToDouble(this::safeDouble)
                .sum();

        List<MarketingChannelShareDto> dynamicChannels = byType.stream()
                .map(agg -> toChannelShare(agg, totalRevenue))
                .sorted(Comparator.comparing(MarketingChannelShareDto::getSharePercent).reversed())
                .toList();

        if (!dynamicChannels.isEmpty()) {
            return dynamicChannels;
        }
        return List.of(
                new MarketingChannelShareDto(MarketingCampaignType.EMAIL, 0d),
                new MarketingChannelShareDto(MarketingCampaignType.SMS, 0d),
                new MarketingChannelShareDto(MarketingCampaignType.SOCIAL, 0d)
        );
    }

    private MarketingChannelShareDto toChannelShare(MarketingCampaignRepository.TypeRevenueAgg agg, double totalRevenue) {
        double channelRevenue = safeDouble(agg.getRevenue());
        double share = totalRevenue > 0d ? (channelRevenue * 100d) / totalRevenue : 0d;
        return new MarketingChannelShareDto(agg.getType(), share);
    }
}
