package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingV2ResponseDto(
        Long id,
        String orderNumber,
        String trackingNumber,
        String deliveryType,
        Status status,
        LocalDateTime updatedAt,
        LocalDateTime deliveryDate,
        List<PublicOrderTrackingStepDto> history
) {
}
