package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingIntegrationsDto;
import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingIntegrationsUpdateDto;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/backoffice/integrations", "/api/backoffice/integrations"})
@RequiredArgsConstructor
public class BackOfficeIntegrationsController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<BackOfficeSettingIntegrationsDto> get() {
        return ResponseEntity.ok(backOfficeSettingService.getIntegrations());
    }

    @PutMapping
    public ResponseEntity<BackOfficeSettingIntegrationsDto> update(@RequestBody BackOfficeSettingIntegrationsUpdateDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateIntegrations(dto));
    }
}
