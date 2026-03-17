package com.lifeevent.lid.user.customer.profile.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.service.OrderService;
import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.profile.dto.CustomerCheckoutCollectionDto;
import com.lifeevent.lid.user.customer.profile.dto.CustomerProfileCollectionDto;
import com.lifeevent.lid.user.customer.profile.service.CustomerProfileService;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.wishlist.dto.WishlistDto;
import com.lifeevent.lid.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerProfileServiceImpl implements CustomerProfileService {

    private final CustomerService customerService;
    private final OrderService orderService;
    private final WishlistService wishlistService;

    @Override
    public CustomerProfileCollectionDto getMyCollection(int page, int size) {
        String customerId = requireCurrentUserId();

        CustomerDto customer = loadCustomer(customerId);

        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        List<OrderDetailDto> orders = orderService.getOrdersByCustomer(customerId, safePage, safeSize);
        List<WishlistDto> wishlist = wishlistService.getWishlist(customerId);
        List<CustomerAddressDto> addresses = customerService.listAddresses(customerId);

        return new CustomerProfileCollectionDto(customer, orders, wishlist, addresses);
    }

    @Override
    public CustomerCheckoutCollectionDto getMyCheckoutCollection() {
        String customerId = requireCurrentUserId();
        CustomerDto customer = loadCustomer(customerId);
        List<CustomerAddressDto> addresses = customerService.listAddresses(customerId);
        return new CustomerCheckoutCollectionDto(customer, addresses);
    }

    private String requireCurrentUserId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private CustomerDto loadCustomer(String customerId) {
        return customerService.getCustomerById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
    }
}
