package com.lifeevent.lid.backoffice.logistics.service;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeLogisticsService {
    LogisticsKpisDto getKpis(Integer days);
    Page<BackOfficeShipmentDto> getShipments(Pageable pageable, ShipmentStatus status, String carrier, String q);
    BackOfficeShipmentDto upsertShipment(BackOfficeShipmentDto dto);
}
