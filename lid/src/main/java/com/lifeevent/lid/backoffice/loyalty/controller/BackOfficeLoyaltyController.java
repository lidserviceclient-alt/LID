package com.lifeevent.lid.backoffice.loyalty.controller;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.loyalty.service.BackOfficeLoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/back-office/loyalty")
@RequiredArgsConstructor
public class BackOfficeLoyaltyController implements IBackOfficeLoyaltyController {

    private final BackOfficeLoyaltyService backOfficeLoyaltyService;

    @Override
    public ResponseEntity<BackOfficeLoyaltyOverviewDto> getOverview() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getOverview());
    }

    @Override
    public ResponseEntity<List<BackOfficeLoyaltyTierDto>> getTiers() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getTiers());
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyConfigDto> getConfig() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getConfig());
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyConfigDto> updateConfig(BackOfficeLoyaltyConfigDto dto) {
        return ResponseEntity.ok(backOfficeLoyaltyService.updateConfig(dto));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyTierDto> updateTier(Long id, BackOfficeLoyaltyTierDto dto) {
        return ResponseEntity.ok(backOfficeLoyaltyService.updateTier(id, dto));
    }
}
