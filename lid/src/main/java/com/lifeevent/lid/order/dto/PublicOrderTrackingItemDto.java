package com.lifeevent.lid.order.dto;

public record PublicOrderTrackingItemDto(
        Long articleId,
        String articleName,
        String mainImageUrl,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {
}
