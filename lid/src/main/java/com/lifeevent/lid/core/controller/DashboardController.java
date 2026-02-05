package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.DashboardResponseDto;
import com.lifeevent.lid.core.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public DashboardResponseDto getDashboard() {
        return dashboardService.getDashboard();
    }
}
