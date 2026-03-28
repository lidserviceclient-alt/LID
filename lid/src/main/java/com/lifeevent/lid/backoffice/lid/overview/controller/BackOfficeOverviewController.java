package com.lifeevent.lid.backoffice.lid.overview.controller;

import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeAnalyticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewDto;
import com.lifeevent.lid.backoffice.lid.overview.service.BackOfficeOverviewService;
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
    public ResponseEntity<BackOfficeAnalyticsCollectionDto> getAnalyticsCollection(Integer days) {
        BackOfficeOverviewDto overview = backOfficeOverviewService.getOverview(days);
        return ResponseEntity.ok(new BackOfficeAnalyticsCollectionDto(
                overview,
                overview != null ? overview.getAnalyticsSeries() : null,
                null,
                null,
                null
        ));
    }

    @Override
    public ResponseEntity<BackOfficeDashboardResponseDto> getDashboard() {
        return ResponseEntity.ok(backOfficeOverviewService.getDashboard());
    }

    @Override
    public ResponseEntity<BackOfficeOverviewDto> getOverview(Integer days) {
        return ResponseEntity.ok(backOfficeOverviewService.getOverview(days));
    }
}
