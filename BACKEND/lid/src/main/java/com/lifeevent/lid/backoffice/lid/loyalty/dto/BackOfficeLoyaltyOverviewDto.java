package com.lifeevent.lid.backoffice.lid.loyalty.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyOverviewDto {
    private Long vipMembers;
    private Long pointsDistributed;
    private Double pointsValueFcfa;
    private Double retentionRate;
}
