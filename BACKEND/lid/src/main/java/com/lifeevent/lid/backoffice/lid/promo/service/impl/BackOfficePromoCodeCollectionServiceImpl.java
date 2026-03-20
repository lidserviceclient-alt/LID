package com.lifeevent.lid.backoffice.lid.promo.service.impl;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeCollectionDto;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeCollectionService;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeService;
import com.lifeevent.lid.backoffice.lid.shop.service.BackOfficeShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficePromoCodeCollectionServiceImpl implements BackOfficePromoCodeCollectionService {

    private final BackOfficePromoCodeService backOfficePromoCodeService;
    private final BackOfficeShopService backOfficeShopService;

    @Override
    public BackOfficePromoCodeCollectionDto getCollection(Integer days) {
        return BackOfficePromoCodeCollectionDto.builder()
                .promoCodes(backOfficePromoCodeService.getAll())
                .boutiques(backOfficeShopService.getShops())
                .stats(backOfficePromoCodeService.getStats(days))
                .build();
    }
}

