package com.lifeevent.lid.backoffice.lid.finance.dto;

import java.util.List;
import com.lifeevent.lid.common.dto.PageResponse;

public record BackOfficeFinanceCollectionDto(
        BackOfficeFinanceOverviewDto overview,
        List<BackOfficeFinanceTransactionDto> transactions,
        PageResponse<BackOfficeFinanceTransactionDto> transactionsPage
) {
}
