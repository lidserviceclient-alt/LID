package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.FinanceOverviewDto;
import com.lifeevent.lid.core.dto.FinanceTransactionDto;
import com.lifeevent.lid.core.service.FinanceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/backoffice/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/overview")
    public FinanceOverviewDto overview(@RequestParam(value = "days", defaultValue = "30") int days) {
        return financeService.overview(days);
    }

    @GetMapping("/transactions")
    public List<FinanceTransactionDto> transactions(@RequestParam(value = "size", defaultValue = "50") int size) {
        return financeService.latestTransactions(size);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(value = "days", defaultValue = "30") int days) {
        String csv = financeService.exportCsv(days);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=finance-report.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(bytes);
    }
}

