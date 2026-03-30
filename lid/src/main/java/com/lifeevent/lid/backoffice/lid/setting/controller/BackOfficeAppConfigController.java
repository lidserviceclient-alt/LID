package com.lifeevent.lid.backoffice.lid.setting.controller;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingShopProfileDto;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/backoffice/app-config")
@RequiredArgsConstructor
public class BackOfficeAppConfigController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<BackOfficeSettingShopProfileDto> get() {
        return ResponseEntity.ok(backOfficeSettingService.getShopProfile());
    }

    @PutMapping
    public ResponseEntity<BackOfficeSettingShopProfileDto> update(@RequestBody BackOfficeSettingShopProfileDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateShopProfile(dto));
    }
}
