package com.lifeevent.lid.backoffice.lid.notification.controller;

import com.lifeevent.lid.backoffice.lid.notification.dto.BackOfficeNotificationActivityDto;
import com.lifeevent.lid.backoffice.lid.setting.entity.SecurityActivityEntity;
import com.lifeevent.lid.backoffice.lid.setting.repository.SecurityActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/v1/backoffice/notifications")
@RequiredArgsConstructor
public class BackOfficeNotificationController implements IBackOfficeNotificationController {

    private final SecurityActivityRepository securityActivityRepository;

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeNotificationActivityDto>> getNotifications(int page, int size, String since) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size));
        LocalDateTime sinceDt = parseSince(since);
        Page<BackOfficeNotificationActivityDto> payload = loadActivities(sinceDt, pageable).map(this::toDto);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(payload));
    }

    @Override
    public ResponseEntity<Long> getNotificationsCount(String since) {
        LocalDateTime sinceDt = parseSince(since);
        long count = sinceDt == null
                ? securityActivityRepository.count()
                : securityActivityRepository.countByEventAtAfter(sinceDt);
        return ResponseEntity.ok(count);
    }

    private Page<SecurityActivityEntity> loadActivities(LocalDateTime since, Pageable pageable) {
        if (since == null) {
            return securityActivityRepository.findAllByOrderByEventAtDesc(pageable);
        }
        return securityActivityRepository.findByEventAtAfterOrderByEventAtDesc(since, pageable);
    }

    private BackOfficeNotificationActivityDto toDto(SecurityActivityEntity entity) {
        return BackOfficeNotificationActivityDto.builder()
                .id(entity.getId() == null ? null : String.valueOf(entity.getId()))
                .actor(fallbackActor(entity.getUserId()))
                .method(entity.getMethod())
                .path(entity.getPath())
                .status(toStatusCode(entity.getStatus()))
                .summary(entity.getSummary())
                .createdAt(entity.getEventAt())
                .build();
    }

    private int safePage(int page) {
        return Math.max(page, 0);
    }

    private int safeSize(int size) {
        return Math.max(1, size);
    }

    private LocalDateTime parseSince(String since) {
        if (since == null || since.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(since);
        } catch (Exception ignored) {
            return parseSinceFallback(since);
        }
    }

    private String fallbackActor(String actor) {
        return actor == null || actor.isBlank() ? "system" : actor;
    }

    private Integer toStatusCode(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String normalized = status.trim().toUpperCase();
        if ("SUCCESS".equals(normalized) || "OK".equals(normalized)) {
            return 200;
        }
        if ("FAILED".equals(normalized) || "ERROR".equals(normalized) || "KO".equals(normalized)) {
            return 500;
        }
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private LocalDateTime parseSinceFallback(String since) {
        try {
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(since);
            return offsetDateTime.atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception ignored) {
            return parseSinceInstant(since);
        }
    }

    private LocalDateTime parseSinceInstant(String since) {
        try {
            Instant instant = Instant.parse(since);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (Exception ignored) {
            return null;
        }
    }
}
