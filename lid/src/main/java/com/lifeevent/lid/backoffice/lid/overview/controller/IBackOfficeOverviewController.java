package com.lifeevent.lid.backoffice.lid.overview.controller;

import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeAnalyticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

public interface IBackOfficeOverviewController {

    @GetMapping("/analytics/collection")
    ResponseEntity<BackOfficeAnalyticsCollectionDto> getAnalyticsCollection(@RequestParam(required = false) Integer days);

    @GetMapping("/dashboard")
    ResponseEntity<BackOfficeDashboardResponseDto> getDashboard();

    @GetMapping("/overview")
    ResponseEntity<BackOfficeOverviewDto> getOverview(@RequestParam(required = false) Integer days);
}
