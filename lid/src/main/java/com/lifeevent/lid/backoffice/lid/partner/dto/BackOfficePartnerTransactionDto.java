package com.lifeevent.lid.backoffice.lid.partner.dto;

import com.lifeevent.lid.payment.partner.entity.PartnerSettlementStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BackOfficePartnerTransactionDto(
        Long id,
        Long orderId,
        LocalDateTime orderCreatedAt,
        BigDecimal orderAmount,
        String partnerId,
        String partnerName,
        String currency,
        BigDecimal grossAmount,
        BigDecimal discountAllocation,
        BigDecimal shippingAllocation,
        BigDecimal returnCostAllocation,
        BigDecimal marginPercent,
        BigDecimal marginAmount,
        BigDecimal netAmount,
        LocalDateTime transactionDate,
        LocalDateTime eligibleAt,
        LocalDateTime scheduledAt,
        LocalDateTime paidOutAt,
        String payoutReference,
        PartnerSettlementStatus payoutStatus
) {
}
