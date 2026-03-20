package com.lifeevent.lid.backoffice.partner.order.controller;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import com.lifeevent.lid.backoffice.partner.order.service.BackOfficePartnerOrderCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/backoffice/partners/me/orders-crud", "/api/backoffice/partners/me/orders-crud"})
public class BackOfficePartnerOrderCrudController implements IBackOfficePartnerOrderCrudController {

    private final BackOfficePartnerOrderCrudService service;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BackOfficePartnerOrderDto>> listMine(int page, int size) {
        return ResponseEntity.ok(service.listMine(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerOrderDetailDto> getMine(Long id) {
        return ResponseEntity.ok(service.getMine(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerOrderDetailDto> updateMine(Long id, @RequestBody PartnerOrderUpdateRequest request) {
        return ResponseEntity.ok(service.updateMine(id, request));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> cancelMine(Long id, String comment) {
        service.cancelMine(id, comment);
        return ResponseEntity.noContent().build();
    }
}

