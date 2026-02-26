package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record ShipmentItemDto(
        String productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}

