package com.lifeevent.lid.backoffice.partner.controller;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.service.BackOfficePartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/backoffice/partners/me", "/api/backoffice/partners/me"})
public class BackOfficePartnerController implements IBackOfficePartnerController {

    private final BackOfficePartnerService backOfficePartnerService;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerCollectionDto> getCollection(int productLimit, int orderLimit, int customerLimit) {
        return ResponseEntity.ok(backOfficePartnerService.getMyCollection(productLimit, orderLimit, customerLimit));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BackOfficePartnerProductDto>> getProducts(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyProducts(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BackOfficePartnerOrderDto>> getOrders(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyOrders(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BackOfficePartnerCustomerDto>> getCustomers(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyCustomers(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> getSettings() {
        return ResponseEntity.ok(backOfficePartnerService.getMySettings());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> updateSettings(BackOfficePartnerSettingsDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.updateMySettings(dto));
    }
}
