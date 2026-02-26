package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingResponseDto(
        Long orderId,
        String orderNumber,
        String trackingNumber,
        Status currentStatus,
        LocalDateTime updatedAt,
        LocalDateTime deliveryDate,
        List<PublicOrderTrackingStepDto> statusHistory
) {
}

