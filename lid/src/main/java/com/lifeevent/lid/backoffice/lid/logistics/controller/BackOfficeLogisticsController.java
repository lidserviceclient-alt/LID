package com.lifeevent.lid.backoffice.lid.logistics.controller;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentStatusUpdateRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsCollectionService;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/backoffice/logistics", "/api/backoffice/logistics"})
@RequiredArgsConstructor
public class BackOfficeLogisticsController implements IBackOfficeLogisticsController {

    private final BackOfficeLogisticsService backOfficeLogisticsService;
    private final BackOfficeLogisticsCollectionService backOfficeLogisticsCollectionService;

    @Override
    public ResponseEntity<BackOfficeLogisticsCollectionDto> getCollection(
            Integer days,
            int page,
            int size,
            ShipmentStatus status,
            String carrier,
            String q,
            int deliveredPage,
            int deliveredSize,
            ShipmentStatus deliveredStatus,
            String deliveredCarrier,
            String deliveredQ
    ) {
        return ResponseEntity.ok(backOfficeLogisticsCollectionService
                .getCollection(days, page, size, status, carrier, q, deliveredPage, deliveredSize, deliveredStatus, deliveredCarrier, deliveredQ));
    }

    @Override
    public ResponseEntity<LogisticsKpisDto> getKpis(Integer days) {
        return ResponseEntity.ok(backOfficeLogisticsService.getKpis(days));
    }

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeShipmentDto>> getShipments(int page, int size, ShipmentStatus status, String carrier, String q) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeLogisticsService.getShipments(PageRequest.of(page, size), status, carrier, q)));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDto> upsertShipment(BackOfficeShipmentDto dto) {
        return ResponseEntity.ok(backOfficeLogisticsService.upsertShipment(dto));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDetailDto> getShipment(Long id) {
        return ResponseEntity.ok(backOfficeLogisticsService.getShipment(id));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDto> updateShipmentStatus(Long id, BackOfficeShipmentStatusUpdateRequest request) {
        return ResponseEntity.ok(backOfficeLogisticsService.updateShipmentStatus(id, request.getStatus()));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDetailDto> scanShipment(BackOfficeShipmentScanRequest request) {
        return ResponseEntity.ok(backOfficeLogisticsService.scanShipment(request, resolveScannedBy()));
    }

    @Override
    public ResponseEntity<BackOfficeShipmentDto> confirmDelivery(Long id, BackOfficeShipmentDeliveryConfirmRequest request) {
        return ResponseEntity.ok(backOfficeLogisticsService.confirmDelivery(id, request));
    }

    private String resolveScannedBy() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Object email = jwtAuth.getTokenAttributes().get("email");
            return email != null ? String.valueOf(email) : jwtAuth.getName();
        }
        return authentication != null ? authentication.getName() : null;
    }
}
