package com.lifeevent.lid.backoffice.order.dto;

public record BackOfficeReturnRequestItemDto(
        Long id,
        Long articleId,
        String articleName,
        Integer quantity,
        Double unitPrice
) {
}
