package com.lifeevent.lid.backoffice.lid.loyalty.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyTierDto {
    private Long id;
    private String name;
    private Integer minPoints;
    private Integer members;
    private String benefits;
}
