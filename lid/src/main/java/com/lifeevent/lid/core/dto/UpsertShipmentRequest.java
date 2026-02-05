package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.StatutLivraison;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertShipmentRequest {

    @NotBlank
    private String orderId;

    private String carrier;
    private String trackingId;

    @NotNull
    private StatutLivraison status;

    private LocalDate eta;
    private BigDecimal cost;
}

