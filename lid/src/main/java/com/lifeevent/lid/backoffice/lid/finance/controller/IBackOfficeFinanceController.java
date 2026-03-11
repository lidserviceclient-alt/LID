package com.lifeevent.lid.backoffice.lid.finance.controller;

import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceTransactionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IBackOfficeFinanceController {

    @GetMapping("/overview")
    ResponseEntity<BackOfficeFinanceOverviewDto> getOverview(@RequestParam(defaultValue = "30") Integer days);

    @GetMapping("/transactions")
    ResponseEntity<List<BackOfficeFinanceTransactionDto>> getTransactions(@RequestParam(defaultValue = "50") Integer size);

    @GetMapping(value = "/export", produces = "text/csv")
    ResponseEntity<byte[]> export(@RequestParam(defaultValue = "30") Integer days);
}
