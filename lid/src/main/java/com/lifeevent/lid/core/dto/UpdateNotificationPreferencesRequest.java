package com.lifeevent.lid.core.dto;

import java.util.List;

public record UpdateNotificationPreferencesRequest(
        List<NotificationPreferenceUpdate> items
) {
}
