package com.lifeevent.lid.backoffice.lid.finance.controller;

import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceTransactionDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceCollectionDto;
import com.lifeevent.lid.backoffice.lid.finance.service.BackOfficeFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/finance")
@RequiredArgsConstructor
public class BackOfficeFinanceController implements IBackOfficeFinanceController {

    private final BackOfficeFinanceService backOfficeFinanceService;

    @Override
    public ResponseEntity<BackOfficeFinanceCollectionDto> getCollection(Integer days, Integer size) {
        return ResponseEntity.ok(new BackOfficeFinanceCollectionDto(
                backOfficeFinanceService.getOverview(days),
                backOfficeFinanceService.getTransactions(size)
        ));
    }

    @Override
    public ResponseEntity<BackOfficeFinanceOverviewDto> getOverview(Integer days) {
        return ResponseEntity.ok(backOfficeFinanceService.getOverview(days));
    }

    @Override
    public ResponseEntity<List<BackOfficeFinanceTransactionDto>> getTransactions(Integer size) {
        return ResponseEntity.ok(backOfficeFinanceService.getTransactions(size));
    }

    @Override
    public ResponseEntity<byte[]> export(Integer days) {
        byte[] bytes = backOfficeFinanceService.exportCsv(days).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=finance-report.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(bytes);
    }
}
