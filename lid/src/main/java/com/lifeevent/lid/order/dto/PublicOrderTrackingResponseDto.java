package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingResponseDto(
        Long id,
        String orderNumber,
        String trackingNumber,
        String deliveryType,
        Status currentStatus,
        Double amount,
        String currency,
        LocalDateTime updatedAt,
        LocalDateTime deliveryDate,
        List<PublicOrderTrackingItemDto> items,
        List<PublicOrderTrackingStepDto> statusHistory
) {
}
