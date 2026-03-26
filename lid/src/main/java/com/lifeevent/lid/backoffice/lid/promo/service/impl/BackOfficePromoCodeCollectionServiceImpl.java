package com.lifeevent.lid.backoffice.lid.promo.service.impl;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeCollectionDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeCollectionService;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeService;
import com.lifeevent.lid.backoffice.lid.shop.dto.BackOfficeShopDto;
import com.lifeevent.lid.backoffice.lid.shop.service.BackOfficeShopService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficePromoCodeCollectionServiceImpl implements BackOfficePromoCodeCollectionService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final BackOfficePromoCodeService backOfficePromoCodeService;
    private final BackOfficeShopService backOfficeShopService;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    public BackOfficePromoCodeCollectionDto getCollection(Integer days) {
        CompletableFuture<List<BackOfficePromoCodeDto>> promoCodesFuture =
                supplyAggregationAsync(() -> backOfficePromoCodeService.getAll(0, 10));
        CompletableFuture<List<BackOfficeShopDto>> boutiquesFuture = supplyAggregationAsync(backOfficeShopService::getShops);
        CompletableFuture<PromoCodeStatsDto> statsFuture = supplyAggregationAsync(() -> backOfficePromoCodeService.getStats(days));

        CompletableFuture.allOf(promoCodesFuture, boutiquesFuture, statsFuture).join();

        return BackOfficePromoCodeCollectionDto.builder()
                .promoCodes(promoCodesFuture.join())
                .boutiques(boutiquesFuture.join())
                .stats(statsFuture.join())
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
