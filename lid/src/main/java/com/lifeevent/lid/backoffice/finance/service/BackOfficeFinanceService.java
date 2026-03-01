package com.lifeevent.lid.backoffice.finance.service;

import com.lifeevent.lid.backoffice.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.finance.dto.BackOfficeFinanceTransactionDto;

import java.util.List;

public interface BackOfficeFinanceService {
    BackOfficeFinanceOverviewDto getOverview(Integer days);
    List<BackOfficeFinanceTransactionDto> getTransactions(Integer size);
    String exportCsv(Integer days);
}
