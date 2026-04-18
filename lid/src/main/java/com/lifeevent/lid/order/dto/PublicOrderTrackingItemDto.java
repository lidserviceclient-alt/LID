package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.common.enumeration.CommerceItemType;

public record PublicOrderTrackingItemDto(
        CommerceItemType itemType,
        Long articleId,
        Long ticketEventId,
        String articleName,
        String mainImageUrl,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {
}
