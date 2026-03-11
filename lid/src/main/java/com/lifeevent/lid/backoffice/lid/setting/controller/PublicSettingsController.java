package com.lifeevent.lid.backoffice.lid.setting.controller;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingShopProfileDto;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/app-config")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public BackOfficeSettingShopProfileDto getPublicSettings() {
        return backOfficeSettingService.getShopProfile();
    }
}
