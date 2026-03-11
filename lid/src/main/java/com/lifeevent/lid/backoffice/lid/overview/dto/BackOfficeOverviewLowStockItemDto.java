package com.lifeevent.lid.backoffice.lid.overview.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewLowStockItemDto {
    private String name;
    private String sku;
    private Integer stock;
    private Integer threshold;
    private String supplier;
}
