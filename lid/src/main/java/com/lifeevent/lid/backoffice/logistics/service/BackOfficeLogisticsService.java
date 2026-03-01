package com.lifeevent.lid.backoffice.logistics.service;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeLogisticsService {
    LogisticsKpisDto getKpis(Integer days);
    Page<BackOfficeShipmentDto> getShipments(Pageable pageable, ShipmentStatus status, String carrier, String q);
    BackOfficeShipmentDto upsertShipment(BackOfficeShipmentDto dto);
    BackOfficeShipmentDetailDto getShipment(Long id);
    BackOfficeShipmentDto updateShipmentStatus(Long id, ShipmentStatus status);
    BackOfficeShipmentDetailDto scanShipment(BackOfficeShipmentScanRequest request, String scannedBy);
    BackOfficeShipmentDto confirmDelivery(Long id, BackOfficeShipmentDeliveryConfirmRequest request);
}
