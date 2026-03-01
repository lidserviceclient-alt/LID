package com.lifeevent.lid.backoffice.overview.controller;

import com.lifeevent.lid.backoffice.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.overview.dto.BackOfficeOverviewDto;
import com.lifeevent.lid.backoffice.overview.service.BackOfficeOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice", "/api/backoffice"})
@RequiredArgsConstructor
public class BackOfficeOverviewController implements IBackOfficeOverviewController {

    private final BackOfficeOverviewService backOfficeOverviewService;

    @Override
    public ResponseEntity<BackOfficeDashboardResponseDto> getDashboard() {
        return ResponseEntity.ok(backOfficeOverviewService.getDashboard());
    }

    @Override
    public ResponseEntity<BackOfficeOverviewDto> getOverview(Integer days) {
        return ResponseEntity.ok(backOfficeOverviewService.getOverview(days));
    }
}
