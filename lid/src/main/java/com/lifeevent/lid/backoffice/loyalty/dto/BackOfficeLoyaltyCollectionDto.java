package com.lifeevent.lid.backoffice.loyalty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyCollectionDto {
    private BackOfficeLoyaltyOverviewDto overview;
    private List<BackOfficeLoyaltyTierDto> tiers;
    private List<BackOfficeLoyaltyCustomerDto> topCustomers;
    private BackOfficeLoyaltyConfigDto config;
    private Page<BackOfficeLoyaltyCustomerDto> customersPage;
}

