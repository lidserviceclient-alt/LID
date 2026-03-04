package com.lifeevent.lid.user.customer.profile.dto;

import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.wishlist.dto.WishlistDto;

import java.util.List;

public record CustomerProfileCollectionDto(
        CustomerDto customer,
        List<OrderDetailDto> orders,
        List<WishlistDto> wishlist,
        List<CustomerAddressDto> addresses
) {
}
