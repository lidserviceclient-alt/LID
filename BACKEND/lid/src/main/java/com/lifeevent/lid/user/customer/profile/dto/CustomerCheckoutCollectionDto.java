package com.lifeevent.lid.user.customer.profile.dto;

import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.dto.CustomerDto;

import java.util.List;

public record CustomerCheckoutCollectionDto(
        CustomerDto customer,
        List<CustomerAddressDto> addresses
) {
}
