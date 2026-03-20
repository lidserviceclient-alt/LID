package com.lifeevent.lid.backoffice.partner.category.controller;

import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.backoffice.partner.category.service.PartnerSubCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/backoffice/partners/me/categories-crud", "/api/backoffice/partners/me/categories-crud"})
public class BackOfficePartnerCategoryController implements IBackOfficePartnerCategoryController {

    private final PartnerSubCategoryService service;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<PartnerSubCategoryDto>> listMine() {
        return ResponseEntity.ok(service.listMine());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> createMine(@RequestBody PartnerSubCategoryDto dto) {
        return ResponseEntity.ok(service.createMine(dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> getMine(Long id) {
        return ResponseEntity.ok(service.getMine(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> updateMine(Long id, @RequestBody PartnerSubCategoryDto dto) {
        return ResponseEntity.ok(service.updateMine(id, dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteMine(Long id) {
        service.deleteMine(id);
        return ResponseEntity.noContent().build();
    }
}

