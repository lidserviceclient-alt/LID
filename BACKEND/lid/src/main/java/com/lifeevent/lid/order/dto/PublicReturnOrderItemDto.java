package com.lifeevent.lid.order.dto;

public record PublicReturnOrderItemDto(
        Long articleId,
        String articleName,
        Integer quantity,
        Double unitPrice,
        String imageUrl
) {
}
