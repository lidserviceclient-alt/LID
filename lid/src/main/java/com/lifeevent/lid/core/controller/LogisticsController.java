package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.ConfirmDeliveryRequest;
import com.lifeevent.lid.core.dto.LogisticsKpiDto;
import com.lifeevent.lid.core.dto.ScanShipmentRequest;
import com.lifeevent.lid.core.dto.ShipmentDetailDto;
import com.lifeevent.lid.core.dto.ShipmentSummaryDto;
import com.lifeevent.lid.core.dto.UpdateShipmentStatusRequest;
import com.lifeevent.lid.core.dto.UpsertShipmentRequest;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.service.LogisticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

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

    @GetMapping("/shipments/{id}")
    public ShipmentDetailDto getShipment(@PathVariable("id") String id) {
        return logisticsService.getShipmentDetail(id);
    }

    @PutMapping("/shipments/{id}/status")
    public ShipmentSummaryDto updateShipmentStatus(@PathVariable("id") String id,
                                                   @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return logisticsService.updateShipmentStatus(id, request.getStatus());
    }

    @PostMapping("/shipments")
    public ShipmentSummaryDto upsertShipment(@Valid @RequestBody UpsertShipmentRequest request) {
        return logisticsService.upsertShipment(request);
    }

    @PostMapping("/shipments/scan")
    public ResponseEntity<?> scanShipment(@Valid @RequestBody ScanShipmentRequest request, Authentication authentication) {
        try {
            String scannedBy = null;
            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                Object email = jwtAuth.getTokenAttributes().get("email");
                scannedBy = email != null ? String.valueOf(email) : jwtAuth.getName();
            } else if (authentication != null) {
                scannedBy = authentication.getName();
            }
            return ResponseEntity.ok(logisticsService.scanAndStartTransit(request, scannedBy));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/shipments/{id}/deliver")
    public ResponseEntity<?> confirmDelivery(@PathVariable("id") String id,
                                             @Valid @RequestBody ConfirmDeliveryRequest request) {
        try {
            return ResponseEntity.ok(logisticsService.confirmDelivery(id, request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
