package com.lifeevent.lid.backoffice.logistics.controller;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentStatusUpdateRequest;
import com.lifeevent.lid.backoffice.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Logistics", description = "API back-office pour la logistique")
public interface IBackOfficeLogisticsController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficeLogisticsCollectionDto> getCollection(
            @RequestParam(required = false) Integer days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) String carrier,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int deliveredPage,
            @RequestParam(defaultValue = "20") int deliveredSize,
            @RequestParam(required = false) ShipmentStatus deliveredStatus,
            @RequestParam(required = false) String deliveredCarrier,
            @RequestParam(required = false) String deliveredQ
    );

    @GetMapping("/kpis")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "KPIs logistiques")
    @ApiResponse(responseCode = "200", description = "KPIs logistiques")
    ResponseEntity<LogisticsKpisDto> getKpis(
            @Parameter(description = "Nombre de jours") @RequestParam(required = false) Integer days
    );

    @GetMapping("/shipments")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les expéditions")
    @ApiResponse(responseCode = "200", description = "Liste paginée des expéditions")
    ResponseEntity<Page<BackOfficeShipmentDto>> getShipments(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Statut") @RequestParam(required = false) ShipmentStatus status,
            @Parameter(description = "Transporteur") @RequestParam(required = false) String carrier,
            @Parameter(description = "Recherche") @RequestParam(required = false) String q
    );

    @PostMapping("/shipments")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Créer ou mettre à jour une expédition")
    ResponseEntity<BackOfficeShipmentDto> upsertShipment(@RequestBody BackOfficeShipmentDto dto);

    @GetMapping("/shipments/{id}")
    ResponseEntity<BackOfficeShipmentDetailDto> getShipment(@PathVariable Long id);

    @PutMapping("/shipments/{id}/status")
    ResponseEntity<BackOfficeShipmentDto> updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody BackOfficeShipmentStatusUpdateRequest request
    );

    @PostMapping("/shipments/scan")
    ResponseEntity<BackOfficeShipmentDetailDto> scanShipment(@Valid @RequestBody BackOfficeShipmentScanRequest request);

    @PostMapping("/shipments/{id}/deliver")
    ResponseEntity<BackOfficeShipmentDto> confirmDelivery(
            @PathVariable Long id,
            @Valid @RequestBody BackOfficeShipmentDeliveryConfirmRequest request
    );
}
