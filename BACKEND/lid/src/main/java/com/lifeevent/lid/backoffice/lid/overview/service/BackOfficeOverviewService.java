package com.lifeevent.lid.backoffice.lid.overview.service;

import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewDto;

public interface BackOfficeOverviewService {
    BackOfficeDashboardResponseDto getDashboard();
    BackOfficeOverviewDto getOverview(Integer days);
}
