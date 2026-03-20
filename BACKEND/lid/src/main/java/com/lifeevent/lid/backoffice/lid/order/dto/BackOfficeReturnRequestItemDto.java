package com.lifeevent.lid.backoffice.lid.order.dto;

public record BackOfficeReturnRequestItemDto(
        Long id,
        Long articleId,
        String articleName,
        Integer quantity,
        Double unitPrice
) {
}
