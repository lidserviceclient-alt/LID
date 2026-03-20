package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.order.enumeration.Status;

import java.time.LocalDateTime;

public record BackOfficePartnerOrderDto(
        Long id,
        String trackingNumber,
        Status status,
        Double amount,
        String currency,
        String customerId,
        String customerName,
        String customerEmail,
        LocalDateTime createdAt
) {
}
