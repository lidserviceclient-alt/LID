package com.lifeevent.lid.user.customer.service;

import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;

import java.util.List;

public interface CustomerAddressService {
    List<CustomerAddressDto> listAddresses(String customerId);
    CustomerAddressDto createAddress(String customerId, CustomerAddressDto dto);
    CustomerAddressDto updateAddress(String customerId, String addressId, CustomerAddressDto dto);
    void deleteAddress(String customerId, String addressId);
    CustomerAddressDto setDefaultAddress(String customerId, String addressId);
}
