package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentShipperType;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;

import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingShipmentDto(
        Long id,
        String trackingId,
        ShipmentShipperType shipperType,
        String shipperId,
        String shipperLabel,
        String carrier,
        ShipmentStatus status,
        LocalDateTime eta,
        String customerValidationCode,
        String customerFacingComment,
        List<PublicOrderTrackingItemDto> items,
        List<PublicOrderTrackingShipmentHistoryDto> history
) {
}
