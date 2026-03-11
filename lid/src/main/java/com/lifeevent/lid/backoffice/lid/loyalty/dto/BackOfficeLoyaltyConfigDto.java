package com.lifeevent.lid.backoffice.lid.loyalty.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyConfigDto {
    private Long id;
    private Double pointsPerFcfa;
    private Double valuePerPointFcfa;
    private Integer retentionDays;
}
