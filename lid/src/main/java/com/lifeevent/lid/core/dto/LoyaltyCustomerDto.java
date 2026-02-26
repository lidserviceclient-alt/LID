package com.lifeevent.lid.core.dto;

public record LoyaltyCustomerDto(
        String userId,
        String email,
        String phone,
        Integer points,
        String tier
) {
}

