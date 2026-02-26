package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;

public record PublicOrderTrackingStepDto(
        Status status,
        LocalDateTime changedAt,
        String comment
) {
}

