package com.lifeevent.lid.backoffice.lid.partner.dto;

import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;

public record BackOfficePartnerPaymentSettingsDto(
        String partnerId,
        PartnerSettlementMode settlementMode,
        Double marginPercent,
        String payoutWithdrawMode,
        Boolean payoutEnabled
) {
}
