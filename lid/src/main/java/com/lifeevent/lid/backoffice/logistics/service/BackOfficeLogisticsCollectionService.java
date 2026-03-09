package com.lifeevent.lid.backoffice.logistics.service;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;

public interface BackOfficeLogisticsCollectionService {
    BackOfficeLogisticsCollectionDto getCollection(
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
    );
}
