package com.lifeevent.lid.backoffice.loyalty.service;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyAdjustPointsRequest;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTransactionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BackOfficeLoyaltyService {
    BackOfficeLoyaltyOverviewDto getOverview();
    List<BackOfficeLoyaltyTierDto> getTiers();
    BackOfficeLoyaltyTierDto createTier(BackOfficeLoyaltyTierDto dto);
    BackOfficeLoyaltyConfigDto getConfig();
    BackOfficeLoyaltyConfigDto updateConfig(BackOfficeLoyaltyConfigDto dto);
    BackOfficeLoyaltyTierDto updateTier(Long id, BackOfficeLoyaltyTierDto dto);
    void deleteTier(Long id);
    List<BackOfficeLoyaltyCustomerDto> topCustomers(int limit);
    Page<BackOfficeLoyaltyCustomerDto> searchCustomers(String query, Pageable pageable);
    BackOfficeLoyaltyCustomerDto getCustomer(String userId);
    Page<BackOfficeLoyaltyTransactionDto> getTransactions(String userId, Pageable pageable);
    BackOfficeLoyaltyCustomerDto adjustPoints(String userId, BackOfficeLoyaltyAdjustPointsRequest request);
}
