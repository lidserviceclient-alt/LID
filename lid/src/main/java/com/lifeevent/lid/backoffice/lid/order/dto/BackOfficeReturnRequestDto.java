package com.lifeevent.lid.backoffice.lid.order.dto;

import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;

import java.time.LocalDateTime;
import java.util.List;

public record BackOfficeReturnRequestDto(
        Long id,
        String orderNumber,
        String email,
        String customerPhone,
        String reason,
        String details,
        ReturnRequestStatus status,
        LocalDateTime createdAt,
        List<BackOfficeReturnRequestItemDto> items
) {
}
