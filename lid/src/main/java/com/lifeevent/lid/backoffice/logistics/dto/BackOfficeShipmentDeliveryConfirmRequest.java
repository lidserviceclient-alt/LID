package com.lifeevent.lid.backoffice.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentDeliveryConfirmRequest {
    @NotBlank
    private String code;
}
