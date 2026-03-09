package com.lifeevent.lid.backoffice.promo.service;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeCollectionDto;

public interface BackOfficePromoCodeCollectionService {
    BackOfficePromoCodeCollectionDto getCollection(Integer days);
}

