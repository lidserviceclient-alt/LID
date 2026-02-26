package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record IntegrationsConfigDto(
        boolean paydunyaConnected,
        String paydunyaMode,
        String paydunyaPublicKey,
        boolean sendinblueConnected,
        boolean slackConnected,
        boolean googleAnalyticsConnected,
        String googleAnalyticsMeasurementId,
        LocalDateTime updatedAt
) {
}

