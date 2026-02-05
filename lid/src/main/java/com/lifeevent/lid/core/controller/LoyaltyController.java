package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.LoyaltyConfigDto;
import com.lifeevent.lid.core.dto.LoyaltyOverviewDto;
import com.lifeevent.lid.core.dto.LoyaltyTierDto;
import com.lifeevent.lid.core.dto.UpdateLoyaltyTierRequest;
import com.lifeevent.lid.core.dto.UpsertLoyaltyConfigRequest;
import com.lifeevent.lid.core.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/overview")
    public LoyaltyOverviewDto overview() {
        return loyaltyService.overview();
    }

    @GetMapping("/tiers")
    public List<LoyaltyTierDto> tiers() {
        return loyaltyService.listTiers();
    }

    @GetMapping("/config")
    public LoyaltyConfigDto getConfig() {
        return loyaltyService.getConfig();
    }

    @PutMapping("/config")
    public LoyaltyConfigDto updateConfig(@Valid @RequestBody UpsertLoyaltyConfigRequest request) {
        return loyaltyService.updateConfig(request);
    }

    @PutMapping("/tiers/{id}")
    public LoyaltyTierDto updateTier(@PathVariable String id, @Valid @RequestBody UpdateLoyaltyTierRequest request) {
        return loyaltyService.updateTier(id, request);
    }
}

