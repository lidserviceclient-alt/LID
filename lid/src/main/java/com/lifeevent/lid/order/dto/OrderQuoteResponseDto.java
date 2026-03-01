package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderQuoteResponseDto {
    private Double subTotal;
    private Double discountAmount;
    private Double loyaltyDiscountAmount;
    private Double total;
    private Boolean promoApplied;
    private String promoCode;
    private String promoMessage;
    private Boolean loyaltyApplied;
    private String loyaltyTier;
    private Double loyaltyDiscountPercent;
    private Integer loyaltyPoints;
}
