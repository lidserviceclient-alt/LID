package com.lifeevent.lid.backoffice.partner.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerOrderUpdateRequest {
    private String status;
    private String trackingNumber;
    private String comment;
}

