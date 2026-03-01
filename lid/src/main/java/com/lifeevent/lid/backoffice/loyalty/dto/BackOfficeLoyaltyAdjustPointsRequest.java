package com.lifeevent.lid.backoffice.loyalty.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyAdjustPointsRequest {
    @NotNull
    private Integer deltaPoints;

    private String reason;
}
