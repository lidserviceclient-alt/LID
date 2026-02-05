package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLoyaltyTierRequest {

    @NotBlank
    private String name;

    @NotNull
    private Integer minPoints;

    private String benefits;
}

