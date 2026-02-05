package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeOverviewDto;
import com.lifeevent.lid.core.service.BackofficeOverviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice")
public class BackofficeOverviewController {

    private final BackofficeOverviewService overviewService;

    public BackofficeOverviewController(BackofficeOverviewService overviewService) {
        this.overviewService = overviewService;
    }

    @GetMapping("/overview")
    public BackofficeOverviewDto overview(
            @RequestParam(name = "days", required = false) Integer days
    ) {
        return overviewService.getOverview(days);
    }
}
