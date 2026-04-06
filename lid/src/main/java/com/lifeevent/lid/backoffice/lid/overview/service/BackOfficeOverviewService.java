package com.lifeevent.lid.backoffice.lid.overview.service;

import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeAnalyticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewDto;

public interface BackOfficeOverviewService {
    BackOfficeDashboardResponseDto getDashboard();
    BackOfficeAnalyticsCollectionDto getAnalyticsCollection(Integer days);
    BackOfficeOverviewDto getOverview(Integer days);
}
