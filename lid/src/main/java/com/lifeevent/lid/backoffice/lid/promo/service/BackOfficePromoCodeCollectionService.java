package com.lifeevent.lid.backoffice.lid.promo.service;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeCollectionDto;

public interface BackOfficePromoCodeCollectionService {
    BackOfficePromoCodeCollectionDto getCollection(Integer days);
}

