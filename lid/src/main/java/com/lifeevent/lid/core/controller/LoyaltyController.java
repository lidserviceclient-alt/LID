package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.AdjustLoyaltyPointsRequest;
import com.lifeevent.lid.core.dto.CreateLoyaltyTierRequest;
import com.lifeevent.lid.core.dto.LoyaltyConfigDto;
import com.lifeevent.lid.core.dto.LoyaltyCustomerDto;
import com.lifeevent.lid.core.dto.LoyaltyOverviewDto;
import com.lifeevent.lid.core.dto.LoyaltyTierDto;
import com.lifeevent.lid.core.dto.LoyaltyTxDto;
import com.lifeevent.lid.core.dto.UpdateLoyaltyTierRequest;
import com.lifeevent.lid.core.dto.UpsertLoyaltyConfigRequest;
import com.lifeevent.lid.core.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @PostMapping("/tiers")
    public LoyaltyTierDto createTier(@Valid @RequestBody CreateLoyaltyTierRequest request) {
        return loyaltyService.createTier(request);
    }

    @GetMapping("/customers")
    public Object customers(@RequestParam(required = false) String q,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size,
                            @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return loyaltyService.topCustomers(limit);
        }
        return loyaltyService.searchCustomers(q, page, size);
    }

    @GetMapping("/customers/{userId}")
    public LoyaltyCustomerDto getCustomer(@PathVariable String userId) {
        return loyaltyService.getCustomer(userId);
    }

    @GetMapping("/customers/{userId}/transactions")
    public Object transactions(@PathVariable String userId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return loyaltyService.listTransactions(userId, page, size);
    }

    @PostMapping("/customers/{userId}/adjust")
    public LoyaltyCustomerDto adjust(@PathVariable String userId, @Valid @RequestBody AdjustLoyaltyPointsRequest request) {
        return loyaltyService.adjustPoints(userId, request);
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

    @DeleteMapping("/tiers/{id}")
    public void deleteTier(@PathVariable String id) {
        loyaltyService.deleteTier(id);
    }
}
