package com.lifeevent.lid.backoffice.lid.loyalty.service.impl;

import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCollectionDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyCollectionService;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeLoyaltyCollectionServiceImpl implements BackOfficeLoyaltyCollectionService {

    private final BackOfficeLoyaltyService backOfficeLoyaltyService;

    @Override
    public BackOfficeLoyaltyCollectionDto getCollection(String q, int page, int size, Integer topLimit) {
        Page<BackOfficeLoyaltyCustomerDto> customersPage =
                backOfficeLoyaltyService.searchCustomers(q, PageRequest.of(page, size));
        List<BackOfficeLoyaltyCustomerDto> topCustomers = topLimit == null
                ? List.of()
                : backOfficeLoyaltyService.topCustomers(topLimit);

        return BackOfficeLoyaltyCollectionDto.builder()
                .overview(backOfficeLoyaltyService.getOverview())
                .tiers(backOfficeLoyaltyService.getTiers())
                .topCustomers(topCustomers)
                .config(backOfficeLoyaltyService.getConfig())
                .customersPage(customersPage)
                .build();
    }
}
