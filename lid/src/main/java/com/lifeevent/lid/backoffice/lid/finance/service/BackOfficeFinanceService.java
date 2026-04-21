package com.lifeevent.lid.backoffice.lid.finance.service;

import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceTransactionDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BackOfficeFinanceService {
    BackOfficeFinanceOverviewDto getOverview(Integer days);
    List<BackOfficeFinanceTransactionDto> getTransactions(Integer size);
    Page<BackOfficeFinanceTransactionDto> getTransactions(int page, int size);
    String exportCsv(Integer days);
}
