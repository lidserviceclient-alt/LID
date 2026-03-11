package com.lifeevent.lid.backoffice.lid.logistics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShipmentItemDto {
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double lineTotal;
}
