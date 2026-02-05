package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertLoyaltyConfigRequest {

    @NotNull
    private BigDecimal pointsPerFcfa;

    @NotNull
    private BigDecimal valuePerPointFcfa;

    @NotNull
    private Integer retentionDays;
}

