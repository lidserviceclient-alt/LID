package com.lifeevent.lid.payment.partner.service;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.common.dto.PageResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PartnerSettlementService {

    void syncOrderSettlements(Long orderId);

    PageResponse<BackOfficePartnerTransactionDto> listPartnerTransactions(
            String partnerId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    );

    BackOfficePartnerTransactionDto markSettlementPaidManual(String partnerId, Long settlementId);

    BackOfficePartnerTransactionDto paySettlementDirect(String partnerId, Long settlementId);

    BackOfficePartnerTransactionDto scheduleSettlement(String partnerId, Long settlementId, LocalDateTime scheduledAt);

    BackOfficePartnerTransactionDto cancelSettlement(String partnerId, Long settlementId);

    int processDueScheduledSettlements(int batchSize);
}
