package com.lifeevent.lid.backoffice.lid.logistics.service.impl;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsCollectionService;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeLogisticsCollectionServiceImpl implements BackOfficeLogisticsCollectionService {

    private final BackOfficeLogisticsService backOfficeLogisticsService;
    private final BackOfficeSettingService backOfficeSettingService;

    @Override
    public BackOfficeLogisticsCollectionDto getCollection(
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
        Page<BackOfficeShipmentDto> shipmentsPage =
                backOfficeLogisticsService.getShipments(PageRequest.of(page, size), status, carrier, q);
        List<BackOfficeShipmentDto> delivered = backOfficeLogisticsService
                .getShipments(PageRequest.of(deliveredPage, deliveredSize), deliveredStatus, deliveredCarrier, deliveredQ)
                .getContent();

        return BackOfficeLogisticsCollectionDto.builder()
                .kpis(backOfficeLogisticsService.getKpis(days))
                .appConfig(backOfficeSettingService.getShopProfile())
                .delivered(delivered)
                .shipmentsPage(shipmentsPage)
                .build();
    }
}
