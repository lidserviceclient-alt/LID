package com.lifeevent.lid.backoffice.lid.finance.dto;

import java.util.List;

public record BackOfficeFinanceCollectionDto(
        BackOfficeFinanceOverviewDto overview,
        List<BackOfficeFinanceTransactionDto> transactions
) {
}
