package com.lifeevent.lid.backoffice.overview.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeDashboardResponseDto {
    private Long totalOrders;
    private Double totalRevenue;
    private Long pendingOrders;
    private Long activeProducts;
    private Long customers;
    private Long lowStock;
}
