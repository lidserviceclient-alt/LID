package com.lifeevent.lid.backoffice.lid.logistics.service;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDeliveryConfirmRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentScanRequest;
import com.lifeevent.lid.backoffice.lid.logistics.dto.LogisticsKpisDto;
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
