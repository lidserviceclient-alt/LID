package com.lifeevent.lid.backoffice.partner.controller;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Partner", description = "API back-office partner/seller")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficePartnerCollectionDto> getCollection(
            @RequestParam(defaultValue = "8") int productLimit,
            @RequestParam(defaultValue = "8") int orderLimit,
            @RequestParam(defaultValue = "8") int customerLimit
    );

    @GetMapping("/products")
    ResponseEntity<Page<BackOfficePartnerProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/orders")
    ResponseEntity<Page<BackOfficePartnerOrderDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/customers")
    ResponseEntity<Page<BackOfficePartnerCustomerDto>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/settings")
    ResponseEntity<BackOfficePartnerSettingsDto> getSettings();

    @PutMapping("/settings")
    ResponseEntity<BackOfficePartnerSettingsDto> updateSettings(@RequestBody BackOfficePartnerSettingsDto dto);
}
