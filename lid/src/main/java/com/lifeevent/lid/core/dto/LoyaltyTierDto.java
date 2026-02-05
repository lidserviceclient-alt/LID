package com.lifeevent.lid.core.dto;

public record LoyaltyTierDto(
        String id,
        String name,
        int minPoints,
        long members,
        String benefits
) {
}

