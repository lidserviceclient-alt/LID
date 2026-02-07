package com.lifeevent.lid.backoffice.promo.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCodeStatsDto {
    private Long totalUsages;
    private Double totalReduction;
    private List<Long> usageSeries;
}
