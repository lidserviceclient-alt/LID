package com.lifeevent.lid.backoffice.lid.logistics.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentDto {
    private Long id;
    private String orderId;
    private String carrier;
    private String trackingId;
    private ShipmentStatus status;
    private LocalDate eta;
    private Double cost;
}
