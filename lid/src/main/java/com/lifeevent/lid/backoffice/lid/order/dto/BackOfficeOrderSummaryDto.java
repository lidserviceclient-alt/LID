package com.lifeevent.lid.backoffice.lid.order.dto;

import com.lifeevent.lid.backoffice.lid.order.enumeration.BackOfficeOrderStatus;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOrderSummaryDto {
    private Long id;
    private String orderNumber;
    private String customer;
    private Integer items;
    private Double total;
    private BackOfficeOrderStatus status;
    private ShipmentStatus shipmentStatus;
    private String courierReference;
    private String courierName;
    private String courierPhone;
    private String courierUser;
    private LocalDateTime courierScannedAt;
    private LocalDateTime dateCreation;
}
