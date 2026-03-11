package com.lifeevent.lid.backoffice.lid.loyalty.dto;

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
