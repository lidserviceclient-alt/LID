package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeActivityDto;
import com.lifeevent.lid.core.service.BackofficeActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/backoffice/notifications")
public class BackofficeNotificationsController {

    private final BackofficeActivityService activityService;

    public BackofficeNotificationsController(BackofficeActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public Page<BackofficeActivityDto> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "since", required = false) String since
    ) {
        Pageable pageable = PageRequest.of(page, size);
        LocalDateTime sinceDt = parseLocalDateTime(since);
        return activityService.list(sinceDt, pageable);
    }

    @GetMapping("/count")
    public long count(@RequestParam(value = "since", required = false) String since) {
        LocalDateTime sinceDt = parseLocalDateTime(since);
        return activityService.countSince(sinceDt);
    }

    private static LocalDateTime parseLocalDateTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value);
        } catch (Exception ex) {
            try {
                OffsetDateTime odt = OffsetDateTime.parse(value);
                return odt.atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
            } catch (Exception ignored) {
                try {
                    Instant instant = Instant.parse(value);
                    return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
                } catch (Exception ignored2) {
                    return null;
                }
            }
        }
    }
}
