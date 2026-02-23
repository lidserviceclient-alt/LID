package com.lifeevent.lid.core.dto;

public record NewsletterStatsDto(
        long total,
        long subscribed,
        long unsubscribed
) {
}

