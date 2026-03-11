package com.lifeevent.lid.backoffice.lid.loyalty.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyCustomerDto {
    private String userId;
    private String email;
    private String phone;
    private Integer points;
    private String tier;
}
