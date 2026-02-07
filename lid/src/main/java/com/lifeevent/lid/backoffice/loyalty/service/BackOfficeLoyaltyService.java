package com.lifeevent.lid.backoffice.loyalty.service;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;

import java.util.List;

public interface BackOfficeLoyaltyService {
    BackOfficeLoyaltyOverviewDto getOverview();
    List<BackOfficeLoyaltyTierDto> getTiers();
    BackOfficeLoyaltyConfigDto getConfig();
    BackOfficeLoyaltyConfigDto updateConfig(BackOfficeLoyaltyConfigDto dto);
    BackOfficeLoyaltyTierDto updateTier(Long id, BackOfficeLoyaltyTierDto dto);
}
