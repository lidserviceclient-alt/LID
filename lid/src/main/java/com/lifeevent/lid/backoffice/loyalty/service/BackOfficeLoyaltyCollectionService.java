package com.lifeevent.lid.backoffice.loyalty.service;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyCollectionDto;

public interface BackOfficeLoyaltyCollectionService {
    BackOfficeLoyaltyCollectionDto getCollection(String q, int page, int size, Integer topLimit);
}
