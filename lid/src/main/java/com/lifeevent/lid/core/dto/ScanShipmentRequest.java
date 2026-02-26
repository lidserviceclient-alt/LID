package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanShipmentRequest {
    @NotBlank
    private String qr;

    private String courierReference;
    private String courierName;
    private String courierPhone;
}

