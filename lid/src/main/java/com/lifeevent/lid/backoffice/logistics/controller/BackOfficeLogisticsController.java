package com.lifeevent.lid.backoffice.logistics.controller;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.backoffice.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/back-office/logistics")
@RequiredArgsConstructor
public class BackOfficeLogisticsController implements IBackOfficeLogisticsController {

    private final BackOfficeLogisticsService backOfficeLogisticsService;

    @Override
    public ResponseEntity<LogisticsKpisDto> getKpis(Integer days) {
        return ResponseEntity.ok(backOfficeLogisticsService.getKpis(days));
    }

    @Override
    public ResponseEntity<Page<BackOfficeShipmentDto>> getShipments(int page, int size, ShipmentStatus status, String carrier, String q) {
        return ResponseEntity.ok(backOfficeLogisticsService.getShipments(PageRequest.of(page, size), status, carrier, q));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDto> upsertShipment(BackOfficeShipmentDto dto) {
        return ResponseEntity.ok(backOfficeLogisticsService.upsertShipment(dto));
    }
}
