package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.StatutLivraison;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShipmentStatusRequest {
    @NotNull
    private StatutLivraison status;
}

