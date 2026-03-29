package com.lifeevent.lid.backoffice.lid.logistics.service;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeDeliveryBootstrapDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailsCollectionDto;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;

import java.util.List;

public interface BackOfficeLogisticsCollectionService {
    BackOfficeLogisticsCollectionDto getCollection(
            Integer days,
            int page,
            int size,
            Integer limit,
            String sortKey,
            ShipmentStatus status,
            String carrier,
            String q,
            int deliveredPage,
            int deliveredSize,
            ShipmentStatus deliveredStatus,
            String deliveredCarrier,
            String deliveredQ
    );

    BackOfficeDeliveryBootstrapDto getDeliveryBootstrap(
            Integer days,
            int page,
            int size,
            Integer limit,
            String sortKey,
            ShipmentStatus status,
            String carrier,
            String q,
            int deliveredPage,
            int deliveredSize,
            ShipmentStatus deliveredStatus,
            String deliveredCarrier,
            String deliveredQ
    );

    BackOfficeShipmentDetailsCollectionDto getShipmentDetailsCollection(List<Long> ids);
}
