package com.lifeevent.lid.backoffice.lid.loyalty.service.impl;

import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCollectionDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyCollectionService;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeLoyaltyCollectionServiceImpl implements BackOfficeLoyaltyCollectionService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final BackOfficeLoyaltyService backOfficeLoyaltyService;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    public BackOfficeLoyaltyCollectionDto getCollection(String q, int page, int size, Integer topLimit) {
        CompletableFuture<Page<BackOfficeLoyaltyCustomerDto>> customersPageFuture =
                supplyAggregationAsync(() -> backOfficeLoyaltyService.searchCustomers(q, PageRequest.of(page, size)));
        CompletableFuture<List<BackOfficeLoyaltyCustomerDto>> topCustomersFuture = topLimit == null
                ? CompletableFuture.completedFuture(List.of())
                : supplyAggregationAsync(() -> backOfficeLoyaltyService.topCustomers(topLimit));
        CompletableFuture<BackOfficeLoyaltyOverviewDto> overviewFuture =
                supplyAggregationAsync(backOfficeLoyaltyService::getOverview);
        CompletableFuture<List<BackOfficeLoyaltyTierDto>> tiersFuture =
                supplyAggregationAsync(backOfficeLoyaltyService::getTiers);
        CompletableFuture<BackOfficeLoyaltyConfigDto> configFuture =
                supplyAggregationAsync(backOfficeLoyaltyService::getConfig);

        CompletableFuture.allOf(
                customersPageFuture,
                topCustomersFuture,
                overviewFuture,
                tiersFuture,
                configFuture
        ).join();

        return BackOfficeLoyaltyCollectionDto.builder()
                .overview(overviewFuture.join())
                .tiers(tiersFuture.join())
                .topCustomers(topCustomersFuture.join())
                .config(configFuture.join())
                .customersPage(customersPageFuture.join())
                .build();
    }

    private <T> CompletableFuture<T> supplyAggregationAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    tx.setReadOnly(true);
                    return tx.execute(status -> supplier.get());
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }
}
