package com.lifeevent.lid.backoffice.marketing.controller;

import com.lifeevent.lid.backoffice.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.backoffice.marketing.dto.MarketingOverviewDto;
import com.lifeevent.lid.backoffice.marketing.service.BackOfficeMarketingService;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/back-office/marketing")
@RequiredArgsConstructor
public class BackOfficeMarketingController implements IBackOfficeMarketingController {

    private final BackOfficeMarketingService backOfficeMarketingService;

    @Override
    public ResponseEntity<MarketingOverviewDto> getOverview(Integer days) {
        return ResponseEntity.ok(backOfficeMarketingService.getOverview(days));
    }

    @Override
    public ResponseEntity<Page<BackOfficeMarketingCampaignDto>> getCampaigns(int page, int size, MarketingCampaignStatus status) {
        return ResponseEntity.ok(backOfficeMarketingService.getCampaigns(PageRequest.of(page, size), status));
    }

    @Override
    public ResponseEntity<BackOfficeMarketingCampaignDto> createCampaign(BackOfficeMarketingCampaignDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeMarketingService.createCampaign(dto));
    }

    @Override
    public ResponseEntity<BackOfficeMarketingCampaignDto> updateCampaign(Long id, BackOfficeMarketingCampaignDto dto) {
        return ResponseEntity.ok(backOfficeMarketingService.updateCampaign(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteCampaign(Long id) {
        backOfficeMarketingService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}
