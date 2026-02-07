package com.lifeevent.lid.backoffice.order.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOrderQuoteResponse {
    private Double subTotal;
    private Double discountAmount;
    private Double total;
    private Boolean promoApplied;
    private String promoCode;
    private String promoMessage;
}
