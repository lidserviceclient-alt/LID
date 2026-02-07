package com.lifeevent.lid.backoffice.logistics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsKpisDto {
    private Long inTransitCount;
    private Double avgDelayDays;
    private Double avgCost;
}
