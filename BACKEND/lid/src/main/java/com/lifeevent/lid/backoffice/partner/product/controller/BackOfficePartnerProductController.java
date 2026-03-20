package com.lifeevent.lid.backoffice.partner.product.controller;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.partner.product.service.BackOfficePartnerProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/backoffice/partners/me/products-crud", "/api/backoffice/partners/me/products-crud"})
public class BackOfficePartnerProductController implements IBackOfficePartnerProductController {

    private final BackOfficePartnerProductService service;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BackOfficeProductDto>> getMyProducts(int page, int size) {
        return ResponseEntity.ok(service.getMyProducts(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> createMyProduct(@RequestBody BackOfficeProductDto dto) {
        return ResponseEntity.ok(service.createMyProduct(dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> getMyProduct(Long id) {
        return ResponseEntity.ok(service.getMyProduct(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> updateMyProduct(Long id, @RequestBody BackOfficeProductDto dto) {
        return ResponseEntity.ok(service.updateMyProduct(id, dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteMyProduct(Long id) {
        service.deleteMyProduct(id);
        return ResponseEntity.noContent().build();
    }
}
