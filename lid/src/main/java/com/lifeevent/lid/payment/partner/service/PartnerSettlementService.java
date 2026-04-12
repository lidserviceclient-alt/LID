package com.lifeevent.lid.payment.partner.service;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.common.dto.PageResponse;

import java.time.LocalDate;

public interface PartnerSettlementService {

    void syncOrderSettlements(Long orderId);

    PageResponse<BackOfficePartnerTransactionDto> listPartnerTransactions(
            String partnerId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    );
}
