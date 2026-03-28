package com.lifeevent.lid.backoffice.lid.overview.dto;

public record BackOfficeAnalyticsConversionFunnelDto(
        Integer visitors,
        Integer addToCart,
        Integer checkout,
        Integer purchases
) {
}
