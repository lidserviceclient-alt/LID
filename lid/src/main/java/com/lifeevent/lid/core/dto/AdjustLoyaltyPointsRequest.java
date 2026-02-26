package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustLoyaltyPointsRequest {

    @NotNull
    private Integer deltaPoints;

    private String reason;
}

