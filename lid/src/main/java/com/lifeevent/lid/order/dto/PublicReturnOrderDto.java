package com.lifeevent.lid.order.dto;

import java.util.List;

public record PublicReturnOrderDto(
        Long orderId,
        String orderNumber,
        Double amount,
        String currency,
        List<PublicReturnOrderItemDto> items
) {
}

