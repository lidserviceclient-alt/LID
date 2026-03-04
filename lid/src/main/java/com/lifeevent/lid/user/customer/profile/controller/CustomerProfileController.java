package com.lifeevent.lid.user.customer.profile.controller;

import com.lifeevent.lid.user.customer.profile.dto.CustomerProfileCollectionDto;
import com.lifeevent.lid.user.customer.profile.service.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/customers/me")
public class CustomerProfileController implements ICustomerProfileController {

    private final CustomerProfileService customerProfileService;

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<CustomerProfileCollectionDto> getMyCollection(int page, int size) {
        return ResponseEntity.ok(customerProfileService.getMyCollection(page, size));
    }
}
