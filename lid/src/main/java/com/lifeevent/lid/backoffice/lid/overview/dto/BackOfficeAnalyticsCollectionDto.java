package com.lifeevent.lid.backoffice.lid.overview.dto;

import java.util.List;

public record BackOfficeAnalyticsCollectionDto(
        BackOfficeOverviewDto overview,
        List<Integer> trafficSeries,
        List<BackOfficeAnalyticsChannelMixDto> channelMix,
        BackOfficeAnalyticsConversionFunnelDto conversionFunnel,
        List<Integer> revenueSeries
) {
}
