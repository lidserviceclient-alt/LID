package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;

import java.time.LocalDateTime;

public record PublicOrderTrackingShipmentHistoryDto(
        ShipmentStatus status,
        String label,
        LocalDateTime changedAt,
        String comment
) {
}
