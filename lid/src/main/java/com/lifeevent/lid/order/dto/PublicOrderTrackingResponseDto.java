package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingResponseDto(
        Long id,
        String orderNumber,
        String trackingNumber,
        String customerValidationCode,
        String deliveryType,
        Status currentStatus,
        Double amount,
        Double shippingCost,
        String shippingMethodCode,
        String shippingMethodLabel,
        String currency,
        LocalDateTime updatedAt,
        LocalDateTime deliveryDate,
        List<PublicOrderTrackingItemDto> items,
        List<PublicOrderTrackingShipmentDto> shipments,
        List<PublicOrderTrackingStepDto> statusHistory
) {
}
