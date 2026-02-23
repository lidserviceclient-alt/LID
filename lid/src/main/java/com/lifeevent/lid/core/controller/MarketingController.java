package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.MarketingCampaignDto;
import com.lifeevent.lid.core.dto.MarketingOverviewDto;
import com.lifeevent.lid.core.dto.UpsertMarketingCampaignRequest;
import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.service.MarketingAutomationService;
import com.lifeevent.lid.core.service.MarketingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/marketing")
public class MarketingController {

    private final MarketingService marketingService;
    private final MarketingAutomationService marketingAutomationService;

    public MarketingController(MarketingService marketingService, MarketingAutomationService marketingAutomationService) {
        this.marketingService = marketingService;
        this.marketingAutomationService = marketingAutomationService;
    }

    @GetMapping("/overview")
    public MarketingOverviewDto overview(@RequestParam(value = "days", defaultValue = "30") int days) {
        return marketingService.overview(days);
    }

    @GetMapping("/campaigns")
    public Page<MarketingCampaignDto> listCampaigns(
            @RequestParam(value = "status", required = false) MarketingCampaignStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return marketingService.listCampaigns(status, pageable);
    }

    @PostMapping("/campaigns")
    public MarketingCampaignDto create(@Valid @RequestBody UpsertMarketingCampaignRequest request) {
        return marketingService.create(request);
    }

    @PutMapping("/campaigns/{id}")
    public MarketingCampaignDto update(@PathVariable String id, @Valid @RequestBody UpsertMarketingCampaignRequest request) {
        return marketingService.update(id, request);
    }

    @PostMapping("/campaigns/{id}/send")
    public MarketingCampaignDto sendNow(@PathVariable String id) {
        return marketingAutomationService.queueSendNow(id);
    }

    @DeleteMapping("/campaigns/{id}")
    public void delete(@PathVariable String id) {
        marketingService.delete(id);
    }
}
