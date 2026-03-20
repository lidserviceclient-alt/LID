package com.lifeevent.lid.backoffice.partner.dto;

import java.time.LocalDateTime;

public record BackOfficePartnerCustomerDto(
        String userId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        long totalOrders,
        double totalSpent,
        LocalDateTime lastOrderAt
) {
}
