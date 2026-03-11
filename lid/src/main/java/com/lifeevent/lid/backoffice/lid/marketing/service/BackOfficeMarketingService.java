package com.lifeevent.lid.backoffice.lid.marketing.service;

import com.lifeevent.lid.backoffice.lid.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.backoffice.lid.marketing.dto.MarketingOverviewDto;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeMarketingService {
    MarketingOverviewDto getOverview(Integer days);
    Page<BackOfficeMarketingCampaignDto> getCampaigns(Pageable pageable, MarketingCampaignStatus status);
    BackOfficeMarketingCampaignDto createCampaign(BackOfficeMarketingCampaignDto dto);
    BackOfficeMarketingCampaignDto updateCampaign(Long id, BackOfficeMarketingCampaignDto dto);
    BackOfficeMarketingCampaignDto sendCampaign(Long id);
    void deleteCampaign(Long id);
}
