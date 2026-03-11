package com.lifeevent.lid.backoffice.lid.logistics.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentDetailDto {
    private Long id;
    private String trackingId;
    private String orderId;
    private String carrier;
    private ShipmentStatus status;
    private LocalDate eta;
    private Double cost;

    private Double orderTotal;
    private String currency;
    private boolean paid;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;

    private List<BackOfficeShipmentItemDto> items;

    private String courierReference;
    private String courierName;
    private String courierPhone;
    private String courierUser;
    private LocalDateTime scannedAt;
}
