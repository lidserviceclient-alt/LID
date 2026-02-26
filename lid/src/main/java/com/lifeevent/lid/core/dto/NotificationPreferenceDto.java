package com.lifeevent.lid.core.dto;

public record NotificationPreferenceDto(
        String key,
        String label,
        boolean enabled
) {
}

