package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.StatutLivraison;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ShipmentSummaryDto(
        String id,
        String trackingId,
        String orderId,
        String carrier,
        StatutLivraison status,
        LocalDate eta,
        BigDecimal cost
) {
}

