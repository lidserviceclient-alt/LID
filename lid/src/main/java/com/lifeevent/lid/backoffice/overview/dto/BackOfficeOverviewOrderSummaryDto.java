package com.lifeevent.lid.backoffice.overview.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewOrderSummaryDto {
    private String id;
    private String customer;
    private Integer items;
    private Double total;
    private String status;
    private String shipmentStatus;
    private String courierReference;
    private String courierName;
    private String courierPhone;
    private String courierUser;
    private LocalDateTime courierScannedAt;
    private LocalDateTime dateCreation;
}
