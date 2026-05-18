package com.lifeevent.lid.backoffice.lid.logistics.dto;

import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.enumeration.ShipmentShipperType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentDto {
    private Long id;
    private String orderId;
    private ShipmentShipperType shipperType;
    private String shipperId;
    private String shipperLabel;
    private String handoffCode;
    private String carrier;
    private String trackingId;
    private ShipmentStatus status;
    private LocalDateTime eta;
    private Double cost;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private Double customerLatitude;
    private Double customerLongitude;
    private String customerEmail;
    private LocalDateTime scannedAt;
    private String courierName;
    private String courierReference;
    private String deliveryIssueComment;
    private String customerFacingComment;
}
