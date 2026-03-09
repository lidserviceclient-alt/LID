package com.lifeevent.lid.user.customer.profile.controller;

import com.lifeevent.lid.user.customer.profile.dto.CustomerCheckoutCollectionDto;
import com.lifeevent.lid.user.customer.profile.dto.CustomerProfileCollectionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Customer Profile", description = "API agrégée du profil client connecté")
@SecurityRequirement(name = "Bearer Token")
public interface ICustomerProfileController {

    @GetMapping("/collection")
    @Operation(summary = "Collection du profil client connecté")
    ResponseEntity<CustomerProfileCollectionDto> getMyCollection(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    );

    @GetMapping("/checkout/collection")
    @Operation(summary = "Collection checkout du client connecté")
    ResponseEntity<CustomerCheckoutCollectionDto> getMyCheckoutCollection();
}
