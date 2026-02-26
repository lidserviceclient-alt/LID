package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.StatutLivraison;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ShipmentDetailDto(
        String id,
        String trackingId,
        String orderId,
        String carrier,
        StatutLivraison status,
        LocalDate eta,
        BigDecimal cost,
        BigDecimal orderTotal,
        String currency,
        boolean paid,
        String customerName,
        String customerEmail,
        String customerPhone,
        String customerAddress,
        List<ShipmentItemDto> items,
        String courierReference,
        String courierName,
        String courierPhone,
        String courierUser,
        LocalDateTime scannedAt
) {
}
