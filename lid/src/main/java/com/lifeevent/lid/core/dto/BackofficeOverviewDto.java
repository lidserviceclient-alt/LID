package com.lifeevent.lid.core.dto;

import java.util.List;

public record BackofficeOverviewDto(
        DashboardResponseDto dashboard,
        List<OrderSummaryDto> recentOrders,
        List<OrderPipelineStepDto> orderPipeline,
        List<Integer> analyticsSeries,
        List<Integer> promoUsageSeries,
        List<LowStockItemDto> lowStock,
        List<TopProductDto> topProducts,
        List<TeamActivityItemDto> teamActivity,
        TeamProductivityDto teamProductivity
) {
}
