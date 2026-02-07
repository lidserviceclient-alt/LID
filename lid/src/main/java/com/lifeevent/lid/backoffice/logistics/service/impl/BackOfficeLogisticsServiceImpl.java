package com.lifeevent.lid.backoffice.logistics.service.impl;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.logistics.dto.LogisticsKpisDto;
import com.lifeevent.lid.backoffice.logistics.mapper.BackOfficeShipmentMapper;
import com.lifeevent.lid.backoffice.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeLogisticsServiceImpl implements BackOfficeLogisticsService {

    private final ShipmentRepository shipmentRepository;
    private final BackOfficeShipmentMapper backOfficeShipmentMapper;

    @Override
    @Transactional(readOnly = true)
    public LogisticsKpisDto getKpis(Integer days) {
        // Stub KPI calculation: minimal defaults
        return LogisticsKpisDto.builder()
                .inTransitCount(0L)
                .avgDelayDays(0d)
                .avgCost(0d)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeShipmentDto> getShipments(Pageable pageable, ShipmentStatus status, String carrier, String q) {
        return shipmentRepository.search(status, carrier, q, pageable)
                .map(backOfficeShipmentMapper::toDto);
    }

    @Override
    public BackOfficeShipmentDto upsertShipment(BackOfficeShipmentDto dto) {
        if (dto == null) throw new IllegalArgumentException("Shipment invalide");
        Shipment entity;
        if (dto.getId() != null) {
            entity = shipmentRepository.findById(dto.getId()).orElse(null);
            if (entity == null) {
                entity = backOfficeShipmentMapper.toEntity(dto);
            } else {
                backOfficeShipmentMapper.updateEntityFromDto(dto, entity);
            }
        } else {
            entity = backOfficeShipmentMapper.toEntity(dto);
        }
        if (entity.getStatus() == null) {
            entity.setStatus(ShipmentStatus.EN_PREPARATION);
        }
        Shipment saved = shipmentRepository.save(entity);
        return backOfficeShipmentMapper.toDto(saved);
    }
}
