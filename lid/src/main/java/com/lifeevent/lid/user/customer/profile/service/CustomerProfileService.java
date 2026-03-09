package com.lifeevent.lid.user.customer.profile.service;

import com.lifeevent.lid.user.customer.profile.dto.CustomerCheckoutCollectionDto;
import com.lifeevent.lid.user.customer.profile.dto.CustomerProfileCollectionDto;

public interface CustomerProfileService {

    CustomerProfileCollectionDto getMyCollection(int page, int size);

    CustomerCheckoutCollectionDto getMyCheckoutCollection();
}
