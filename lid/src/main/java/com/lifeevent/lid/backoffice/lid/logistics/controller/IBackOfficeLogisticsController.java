package com.lifeevent.lid.backoffice.lid.logistics.controller;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeDeliveryBootstrapDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentStatusUpdateRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.LogisticsKpisDto;
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

import java.util.List;

@Tag(name = "BackOffice - Logistics", description = "API back-office pour la logistique")
public interface IBackOfficeLogisticsController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficeLogisticsCollectionDto> getCollection(
            @Parameter(description = "Nombre de jours pour les KPI") @RequestParam(required = false) Integer days,
            @Parameter(description = "Page principale (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille page principale") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Optionnel, prioritaire sur size pour la page principale") @RequestParam(required = false) Integer limit,
            @Parameter(description = "Tri principal: createdAt_desc|createdAt_asc|eta_desc|eta_asc|status_desc|status_asc") @RequestParam(required = false) String sortKey,
            @Parameter(description = "Statut principal") @RequestParam(required = false) ShipmentStatus status,
            @Parameter(description = "Transporteur principal") @RequestParam(required = false) String carrier,
            @Parameter(description = "Recherche principale (trackingId/orderId)") @RequestParam(required = false) String q,
            @Parameter(description = "Page historique livrée (0..N)") @RequestParam(defaultValue = "0") int deliveredPage,
            @Parameter(description = "Taille page historique livrée") @RequestParam(defaultValue = "20") int deliveredSize,
            @Parameter(description = "Statut historique livrée") @RequestParam(required = false) ShipmentStatus deliveredStatus,
            @Parameter(description = "Transporteur historique livrée") @RequestParam(required = false) String deliveredCarrier,
            @Parameter(description = "Recherche historique livrée") @RequestParam(required = false) String deliveredQ
    );

    @GetMapping("/delivery-bootstrap")
    ResponseEntity<BackOfficeDeliveryBootstrapDto> getDeliveryBootstrap(
            @Parameter(description = "Nombre de jours pour les KPI") @RequestParam(required = false) Integer days,
            @Parameter(description = "Page missions (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille page missions") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Optionnel, prioritaire sur size pour la page missions et utilisé pour activeShipments") @RequestParam(required = false) Integer limit,
            @Parameter(description = "Tri missions: createdAt_desc|createdAt_asc|eta_desc|eta_asc|status_desc|status_asc") @RequestParam(required = false) String sortKey,
            @Parameter(description = "Statut missions") @RequestParam(required = false) ShipmentStatus status,
            @Parameter(description = "Transporteur missions") @RequestParam(required = false) String carrier,
            @Parameter(description = "Recherche missions (trackingId/orderId)") @RequestParam(required = false) String q,
            @Parameter(description = "Page historique (0..N)") @RequestParam(defaultValue = "0") int deliveredPage,
            @Parameter(description = "Taille page historique") @RequestParam(defaultValue = "20") int deliveredSize,
            @Parameter(description = "Statut historique") @RequestParam(required = false) ShipmentStatus deliveredStatus,
            @Parameter(description = "Transporteur historique") @RequestParam(required = false) String deliveredCarrier,
            @Parameter(description = "Recherche historique") @RequestParam(required = false) String deliveredQ
    );

    @GetMapping("/shipments/details/collection")
    ResponseEntity<BackOfficeShipmentDetailsCollectionDto> getShipmentDetailsCollection(
            @Parameter(description = "Ids shipments. Format: ids=1,2,3 ou ids=1&ids=2") @RequestParam List<Long> ids
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
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeShipmentDto>> getShipments(
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
