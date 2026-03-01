package com.lifeevent.lid.backoffice.overview.controller;

import com.lifeevent.lid.backoffice.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.overview.dto.BackOfficeOverviewDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

public interface IBackOfficeOverviewController {

    @GetMapping("/dashboard")
    ResponseEntity<BackOfficeDashboardResponseDto> getDashboard();

    @GetMapping("/overview")
    ResponseEntity<BackOfficeOverviewDto> getOverview(@RequestParam(required = false) Integer days);
}
