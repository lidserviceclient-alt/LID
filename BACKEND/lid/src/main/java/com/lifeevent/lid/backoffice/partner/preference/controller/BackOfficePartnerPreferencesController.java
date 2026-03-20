package com.lifeevent.lid.backoffice.partner.preference.controller;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import com.lifeevent.lid.backoffice.partner.preference.service.PartnerPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/backoffice/partners/me/preferences", "/api/backoffice/partners/me/preferences"})
public class BackOfficePartnerPreferencesController implements IBackOfficePartnerPreferencesController {

    private final PartnerPreferencesService service;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerPreferencesDto> getMine() {
        return ResponseEntity.ok(service.getMine());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerPreferencesDto> updateMine(@RequestBody PartnerPreferencesDto dto) {
        return ResponseEntity.ok(service.updateMine(dto));
    }
}

