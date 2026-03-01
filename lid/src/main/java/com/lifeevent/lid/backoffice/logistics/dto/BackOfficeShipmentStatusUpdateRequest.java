package com.lifeevent.lid.backoffice.logistics.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentStatusUpdateRequest {
    @NotNull
    private ShipmentStatus status;
}
