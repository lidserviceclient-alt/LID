package com.lifeevent.lid.backoffice.lid.loyalty.service;

import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCollectionDto;

public interface BackOfficeLoyaltyCollectionService {
    BackOfficeLoyaltyCollectionDto getCollection(String q, int page, int size, Integer topLimit);
}
