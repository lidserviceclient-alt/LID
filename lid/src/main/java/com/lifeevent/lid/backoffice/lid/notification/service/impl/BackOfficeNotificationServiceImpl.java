package com.lifeevent.lid.backoffice.lid.notification.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeevent.lid.backoffice.lid.notification.dto.BackOfficeNotificationDto;
import com.lifeevent.lid.backoffice.lid.notification.dto.CreateBackOfficeNotificationRequest;
import com.lifeevent.lid.backoffice.lid.notification.entity.BackOfficeNotificationEntity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import com.lifeevent.lid.backoffice.lid.notification.repository.BackOfficeNotificationRepository;
import com.lifeevent.lid.backoffice.lid.notification.service.BackOfficeNotificationService;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeNotificationPreferenceRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.realtime.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class BackOfficeNotificationServiceImpl implements BackOfficeNotificationService {

    private static final int DEFAULT_RETENTION_HOURS = 72;
    private static final int READ_RETENTION_HOURS = 24;

    private final BackOfficeNotificationRepository notificationRepository;
    private final BackOfficeNotificationPreferenceRepository notificationPreferenceRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeNotificationDto> getNotifications(int page, int size) {
        NotificationAudience audience = resolveAudience();
        return notificationRepository.findVisibleByAudience(
                        audience.scope(),
                        audience.targetRole(),
                        audience.targetUserId(),
                        PageRequest.of(Math.max(page, 0), Math.max(size, 1))
                )
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        NotificationAudience audience = resolveAudience();
        return notificationRepository.countUnreadByAudience(audience.scope(), audience.targetRole(), audience.targetUserId());
    }

    @Override
    public void markAsRead(String notificationId) {
        Long id = parseId(notificationId);
        NotificationAudience audience = resolveAudience();
        BackOfficeNotificationEntity entity = notificationRepository.findVisibleByIdAndAudience(
                        id,
                        audience.scope(),
                        audience.targetRole(),
                        audience.targetUserId()
                )
                .orElseThrow(() -> new ResourceNotFoundException("BackOfficeNotification", "id", notificationId));
        if (markRead(entity)) {
            publishAudienceUpdate(audience, entity.getType());
        }
    }

    @Override
    public void markAllAsRead() {
        NotificationAudience audience = resolveAudience();
        LocalDateTime now = LocalDateTime.now();
        int updated = notificationRepository.markAllReadByAudience(
                audience.scope(),
                audience.targetRole(),
                audience.targetUserId(),
                now,
                now.plusHours(READ_RETENTION_HOURS)
        );
        if (updated > 0) {
            publishAudienceUpdate(audience, null);
        }
    }

    @Override
    public void create(CreateBackOfficeNotificationRequest request) {
        if (request == null || request.type() == null || request.scope() == null || request.targetRole() == null) {
            return;
        }
        if (!isNotificationTypeEnabled(request.type())) {
            return;
        }
        if (request.dedupeKey() != null && !request.dedupeKey().isBlank()) {
            boolean exists = notificationRepository
                    .findTopByDedupeKeyAndPurgeAfterAfterOrderByCreatedAtDesc(request.dedupeKey().trim(), LocalDateTime.now())
                    .isPresent();
            if (exists) {
                return;
            }
        }

        BackOfficeNotificationEntity entity = BackOfficeNotificationEntity.builder()
                .type(request.type())
                .scope(request.scope())
                .targetRole(request.targetRole())
                .targetUserId(trimToNull(request.targetUserId()))
                .title(fallback(request.title(), request.type().name()))
                .body(fallback(request.body(), request.type().name()))
                .actionPath(trimToNull(request.actionPath()))
                .actionLabel(trimToNull(request.actionLabel()))
                .severity(request.severity() == null ? BackOfficeNotificationSeverity.INFO : request.severity())
                .dedupeKey(trimToNull(request.dedupeKey()))
                .payloadJson(toPayloadJson(request.payload()))
                .purgeAfter(LocalDateTime.now().plusHours(DEFAULT_RETENTION_HOURS))
                .build();
        notificationRepository.save(entity);
        realtimeEventPublisher.publishBackofficeNotificationsCountUpdated(trimToNull(request.targetUserId()), request.type().name());
    }

    private boolean markRead(BackOfficeNotificationEntity entity) {
        if (entity.getReadAt() != null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        entity.setReadAt(now);
        LocalDateTime readRetention = now.plusHours(READ_RETENTION_HOURS);
        if (entity.getPurgeAfter() == null || entity.getPurgeAfter().isAfter(readRetention)) {
            entity.setPurgeAfter(readRetention);
        }
        notificationRepository.save(entity);
        return true;
    }

    private boolean isNotificationTypeEnabled(BackOfficeNotificationType type) {
        return notificationPreferenceRepository.findById(type.name())
                .map(entity -> Boolean.TRUE.equals(entity.getEnabled()))
                .orElse(true);
    }

    private BackOfficeNotificationDto toDto(BackOfficeNotificationEntity entity) {
        return BackOfficeNotificationDto.builder()
                .id(entity.getId() == null ? null : String.valueOf(entity.getId()))
                .type(entity.getType())
                .title(entity.getTitle())
                .body(entity.getBody())
                .severity(entity.getSeverity())
                .actionPath(entity.getActionPath())
                .actionLabel(entity.getActionLabel())
                .createdAt(entity.getCreatedAt())
                .readAt(entity.getReadAt())
                .build();
    }

    private NotificationAudience resolveAudience() {
        String currentUserId = trimToNull(SecurityUtils.getCurrentUserId());
        if (SecurityUtils.hasAnyRole("ADMIN", "SUPER_ADMIN")) {
            return new NotificationAudience(BackOfficeNotificationScope.BACKOFFICE, BackOfficeNotificationTargetRole.ADMIN, currentUserId);
        }
        if (SecurityUtils.hasAnyRole("LIVREUR")) {
            return new NotificationAudience(BackOfficeNotificationScope.DELIVERY, BackOfficeNotificationTargetRole.LIVREUR, currentUserId);
        }
        throw new IllegalStateException("Aucun contexte notification compatible pour l'utilisateur courant");
    }

    private Long parseId(String notificationId) {
        try {
            return Long.parseLong(notificationId);
        } catch (Exception ex) {
            throw new ResourceNotFoundException("BackOfficeNotification", "id", String.valueOf(notificationId));
        }
    }

    private String toPayloadJson(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String fallback(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized == null ? fallback : normalized;
    }

    private void publishAudienceUpdate(NotificationAudience audience, BackOfficeNotificationType type) {
        realtimeEventPublisher.publishBackofficeNotificationsCountUpdated(
                audience.targetUserId(),
                type == null ? "read" : type.name()
        );
    }

    private record NotificationAudience(
            BackOfficeNotificationScope scope,
            BackOfficeNotificationTargetRole targetRole,
            String targetUserId
    ) {
    }
}
