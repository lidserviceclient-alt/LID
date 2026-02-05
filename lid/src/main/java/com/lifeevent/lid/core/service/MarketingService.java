package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.ChannelPerformanceDto;
import com.lifeevent.lid.core.dto.MarketingCampaignDto;
import com.lifeevent.lid.core.dto.MarketingOverviewDto;
import com.lifeevent.lid.core.dto.UpsertMarketingCampaignRequest;
import com.lifeevent.lid.core.entity.MarketingCampaign;
import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.repository.MarketingCampaignRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class MarketingService {

    private final MarketingCampaignRepository marketingCampaignRepository;

    public MarketingService(MarketingCampaignRepository marketingCampaignRepository) {
        this.marketingCampaignRepository = marketingCampaignRepository;
    }

    @Transactional(readOnly = true)
    public MarketingOverviewDto overview(int days) {
        int safeDays = Math.max(1, Math.min(days, 365));
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        BigDecimal revenue = marketingCampaignRepository.sumRevenueFrom(from);
        BigDecimal budget = marketingCampaignRepository.sumBudgetFrom(from);
        double roi = 0.0;
        if (budget != null && budget.compareTo(BigDecimal.ZERO) > 0) {
            roi = revenue.divide(budget, 4, RoundingMode.HALF_UP).doubleValue();
        }

        List<MarketingCampaignRepository.TypeRevenueAgg> byType = marketingCampaignRepository.revenueByTypeFrom(from);
        BigDecimal totalRevenue = byType.stream()
                .map(MarketingCampaignRepository.TypeRevenueAgg::getRevenue)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ChannelPerformanceDto> channels = byType.stream()
                .map((agg) -> {
                    BigDecimal chRev = agg.getRevenue() != null ? agg.getRevenue() : BigDecimal.ZERO;
                    double share = 0.0;
                    if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                        share = chRev.multiply(BigDecimal.valueOf(100))
                                .divide(totalRevenue, 2, RoundingMode.HALF_UP)
                                .doubleValue();
                    }
                    return new ChannelPerformanceDto(agg.getType().name(), share, chRev);
                })
                .sorted(Comparator.comparing(ChannelPerformanceDto::sharePercent).reversed())
                .toList();

        return new MarketingOverviewDto(roi, budget, channels);
    }

    @Transactional(readOnly = true)
    public Page<MarketingCampaignDto> listCampaigns(MarketingCampaignStatus status, Pageable pageable) {
        Page<MarketingCampaign> page = status == null
                ? marketingCampaignRepository.findAll(pageable)
                : marketingCampaignRepository.findByStatus(status, pageable);
        return page.map(this::toDto);
    }

    @Transactional
    public MarketingCampaignDto create(UpsertMarketingCampaignRequest request) {
        MarketingCampaign campaign = new MarketingCampaign();
        apply(campaign, request);
        campaign = marketingCampaignRepository.save(campaign);
        return toDto(campaign);
    }

    @Transactional
    public MarketingCampaignDto update(String id, UpsertMarketingCampaignRequest request) {
        MarketingCampaign campaign = marketingCampaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campagne introuvable"));
        apply(campaign, request);
        campaign = marketingCampaignRepository.save(campaign);
        return toDto(campaign);
    }

    @Transactional
    public void delete(String id) {
        if (!marketingCampaignRepository.existsById(id)) {
            throw new RuntimeException("Campagne introuvable");
        }
        marketingCampaignRepository.deleteById(id);
    }

    private void apply(MarketingCampaign campaign, UpsertMarketingCampaignRequest request) {
        campaign.setName(request.getName().trim());
        campaign.setType(request.getType());
        campaign.setStatus(request.getStatus());
        campaign.setSentCount(request.getSent() != null ? Math.max(0L, request.getSent()) : 0L);
        campaign.setOpenRate(request.getOpenRate());
        campaign.setClickRate(request.getClickRate());
        campaign.setRevenue(request.getRevenue());
        campaign.setBudgetSpent(request.getBudgetSpent());
    }

    private MarketingCampaignDto toDto(MarketingCampaign campaign) {
        return new MarketingCampaignDto(
                campaign.getId(),
                campaign.getName(),
                campaign.getType(),
                campaign.getStatus(),
                campaign.getSentCount() != null ? campaign.getSentCount() : 0L,
                campaign.getOpenRate(),
                campaign.getClickRate(),
                campaign.getRevenue(),
                campaign.getBudgetSpent(),
                campaign.getDateCreation()
        );
    }
}

