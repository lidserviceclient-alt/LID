package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public record OrderQuoteResponse(
        BigDecimal subTotal,
        BigDecimal discountAmount,
        BigDecimal loyaltyDiscountAmount,
        BigDecimal total,
        boolean promoApplied,
        String promoCode,
        String promoMessage,
        boolean loyaltyApplied,
        String loyaltyTier,
        BigDecimal loyaltyDiscountPercent,
        Integer loyaltyPoints
) {
}
