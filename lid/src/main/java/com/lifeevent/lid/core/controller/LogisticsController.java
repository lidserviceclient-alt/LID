package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.LogisticsKpiDto;
import com.lifeevent.lid.core.dto.ShipmentSummaryDto;
import com.lifeevent.lid.core.dto.UpsertShipmentRequest;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.service.LogisticsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/logistics")
public class LogisticsController {

    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    @GetMapping("/kpis")
    public LogisticsKpiDto kpis(@RequestParam(value = "days", defaultValue = "30") int days) {
        return logisticsService.kpis(days);
    }

    @GetMapping("/shipments")
    public Page<ShipmentSummaryDto> listShipments(
            @RequestParam(value = "status", required = false) StatutLivraison status,
            @RequestParam(value = "carrier", required = false) String carrier,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateLivraisonEstimee").and(Sort.by(Sort.Direction.DESC, "id")));
        return logisticsService.listShipments(status, carrier, q, pageable);
    }

    @PostMapping("/shipments")
    public ShipmentSummaryDto upsertShipment(@Valid @RequestBody UpsertShipmentRequest request) {
        return logisticsService.upsertShipment(request);
    }
}

