package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingSecurityDto;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/backoffice/security", "/api/backoffice/security"})
@RequiredArgsConstructor
public class BackOfficeSecurityController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping("/settings")
    public ResponseEntity<BackOfficeSettingSecurityDto> getSettings() {
        return ResponseEntity.ok(backOfficeSettingService.getSecurity());
    }

    @PutMapping("/settings")
    public ResponseEntity<BackOfficeSettingSecurityDto> updateSettings(@RequestBody BackOfficeSettingSecurityDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateSecurity(dto));
    }

    @GetMapping(value = "/activity/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportActivityCsv(@RequestParam(defaultValue = "500") int size) {
        byte[] csv = backOfficeSettingService.exportSecurityActivityCsv(size);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=security-activity.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
