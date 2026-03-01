package com.lifeevent.lid.backoffice.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentScanRequest {
    @NotBlank
    private String qr;

    private String courierReference;
    private String courierName;
    private String courierPhone;
}
