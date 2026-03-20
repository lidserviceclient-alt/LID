package com.lifeevent.lid.backoffice.lid.order.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeCreateOrderRequest {
    private String customerId;
    private String promoCode;
    private List<BackOfficeOrderLineRequest> lines;
}
