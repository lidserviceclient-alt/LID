package com.lifeevent.lid.backoffice.lid.notification.dto;

import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import lombok.Builder;

import java.util.Map;

@Builder
public record CreateBackOfficeNotificationRequest(
        BackOfficeNotificationType type,
        BackOfficeNotificationScope scope,
        BackOfficeNotificationTargetRole targetRole,
        String targetUserId,
        String title,
        String body,
        String actionPath,
        String actionLabel,
        BackOfficeNotificationSeverity severity,
        String dedupeKey,
        Map<String, Object> payload
) {
}
