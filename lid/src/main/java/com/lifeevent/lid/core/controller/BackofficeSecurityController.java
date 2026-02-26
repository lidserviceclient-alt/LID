package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeActivityDto;
import com.lifeevent.lid.core.dto.BackofficeSecuritySettingsDto;
import com.lifeevent.lid.core.service.BackofficeActivityService;
import com.lifeevent.lid.core.service.BackofficeSecuritySettingsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/backoffice/security")
public class BackofficeSecurityController {

    private final BackofficeSecuritySettingsService settingsService;
    private final BackofficeActivityService activityService;

    public BackofficeSecurityController(BackofficeSecuritySettingsService settingsService, BackofficeActivityService activityService) {
        this.settingsService = settingsService;
        this.activityService = activityService;
    }

    @GetMapping("/settings")
    public BackofficeSecuritySettingsDto settings() {
        return new BackofficeSecuritySettingsDto(settingsService.isAdmin2faEnabled());
    }

    @PutMapping("/settings")
    public BackofficeSecuritySettingsDto updateSettings(@RequestBody BackofficeSecuritySettingsDto request) {
        boolean enabled = request != null && Boolean.TRUE.equals(request.admin2faEnabled());
        settingsService.setAdmin2faEnabled(enabled);
        return new BackofficeSecuritySettingsDto(settingsService.isAdmin2faEnabled());
    }

    @GetMapping("/activity/export")
    public ResponseEntity<byte[]> exportActivityCsv(
            @RequestParam(value = "size", defaultValue = "500") int size
    ) {
        int safeSize = Math.max(1, Math.min(size, 500));
        List<BackofficeActivityDto> events = activityService.list(null, PageRequest.of(0, safeSize)).getContent();
        String csv = buildCsv(events);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=security-activity.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    private static String buildCsv(List<BackofficeActivityDto> events) {
        StringBuilder sb = new StringBuilder();
        sb.append("createdAt;actor;method;path;status;summary\n");
        for (BackofficeActivityDto e : events) {
            sb.append(e.createdAt() != null ? e.createdAt().toString() : "").append(';')
                    .append(escape(e.actor())).append(';')
                    .append(escape(e.method())).append(';')
                    .append(escape(e.path())).append(';')
                    .append(e.status() != null ? e.status() : "").append(';')
                    .append(escape(e.summary()))
                    .append('\n');
        }
        return sb.toString();
    }

    private static String escape(String value) {
        if (value == null) return "";
        String v = value.replace("\n", " ").replace("\r", " ").trim();
        return v.replace(";", ",");
    }
}
