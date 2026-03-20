package com.lifeevent.lid.backoffice.partner.dto;

public record BackOfficePartnerStatsDto(
        long products,
        long orders,
        long customers,
        double revenue
) {
}
