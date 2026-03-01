package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;

import java.time.LocalDateTime;

public record ReturnRequestResponseDto(
        Long id,
        String orderNumber,
        ReturnRequestStatus status,
        LocalDateTime createdAt
) {
}
