package com.lifeevent.lid.payment.partner.service.impl;

import com.lifeevent.lid.payment.partner.service.PartnerSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PartnerSettlementScheduler {

    private final PartnerSettlementService partnerSettlementService;

    @Scheduled(fixedDelayString = "${config.partner-settlement.dispatch.delay-ms:60000}")
    public void dispatchScheduledSettlements() {
        partnerSettlementService.processDueScheduledSettlements(50);
    }
}
