package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingNotificationPreferenceDto;
import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingNotificationPreferencesUpdateDto;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/notification-preferences", "/api/backoffice/notification-preferences"})
@RequiredArgsConstructor
public class BackOfficeNotificationPreferencesController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> list() {
        return ResponseEntity.ok(backOfficeSettingService.getNotificationPreferences());
    }

    @PutMapping
    public ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> update(@RequestBody BackOfficeSettingNotificationPreferencesUpdateDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateNotificationPreferences(dto));
    }
}
