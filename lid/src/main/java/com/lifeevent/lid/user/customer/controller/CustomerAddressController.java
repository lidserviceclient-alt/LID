package com.lifeevent.lid.user.customer.controller;

import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.service.CustomerAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final CustomerAddressService addressService;

    @GetMapping
    @PreAuthorize("(#customerId == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<List<CustomerAddressDto>> list(@PathVariable String customerId) {
        return ResponseEntity.ok(addressService.listAddresses(customerId));
    }

    @PostMapping
    @PreAuthorize("(#customerId == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<CustomerAddressDto> create(@PathVariable String customerId, @RequestBody CustomerAddressDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.createAddress(customerId, dto));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("(#customerId == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<CustomerAddressDto> update(@PathVariable String customerId, @PathVariable String addressId, @RequestBody CustomerAddressDto dto) {
        return ResponseEntity.ok(addressService.updateAddress(customerId, addressId, dto));
    }

    @PutMapping("/{addressId}/default")
    @PreAuthorize("(#customerId == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<CustomerAddressDto> setDefault(@PathVariable String customerId, @PathVariable String addressId) {
        return ResponseEntity.ok(addressService.setDefaultAddress(customerId, addressId));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("(#customerId == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String customerId, @PathVariable String addressId) {
        addressService.deleteAddress(customerId, addressId);
        return ResponseEntity.noContent().build();
    }
}
