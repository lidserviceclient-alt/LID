package com.lifeevent.lid.backoffice.overview.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewDto {
    private BackOfficeDashboardResponseDto dashboard;
    private List<BackOfficeOverviewOrderSummaryDto> recentOrders;
    private List<BackOfficeOverviewOrderPipelineStepDto> orderPipeline;
    private List<Integer> analyticsSeries;
    private List<Integer> promoUsageSeries;
    private List<BackOfficeOverviewLowStockItemDto> lowStock;
    private List<BackOfficeOverviewTopProductDto> topProducts;
    private List<BackOfficeOverviewTeamActivityItemDto> teamActivity;
    private BackOfficeOverviewTeamProductivityDto teamProductivity;
}
