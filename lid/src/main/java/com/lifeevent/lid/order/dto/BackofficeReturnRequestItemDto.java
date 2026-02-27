package com.lifeevent.lid.order.dto;

public record BackofficeReturnRequestItemDto(
        Long id,
        Long articleId,
        String articleName,
        Integer quantity,
        Double unitPrice
) {
}
