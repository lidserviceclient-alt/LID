package com.lifeevent.lid.backoffice.overview.service;

import com.lifeevent.lid.backoffice.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.overview.dto.BackOfficeOverviewDto;

public interface BackOfficeOverviewService {
    BackOfficeDashboardResponseDto getDashboard();
    BackOfficeOverviewDto getOverview(Integer days);
}
