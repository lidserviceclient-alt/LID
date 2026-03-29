package com.lifeevent.lid.backoffice.lid.logistics.service.impl;

import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeDeliveryBootstrapDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeLogisticsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDetailsCollectionDto;
import com.lifeevent.lid.backoffice.lid.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsCollectionService;
import com.lifeevent.lid.backoffice.lid.logistics.service.BackOfficeLogisticsService;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

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
    ) {
        int resolvedSize = normalizeMainSize(size, limit);
        PageRequest mainPage = PageRequest.of(Math.max(0, page), resolvedSize, resolveSort(sortKey));
        PageRequest historyPage = PageRequest.of(
                Math.max(0, deliveredPage),
                normalizeSize(deliveredSize),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<BackOfficeShipmentDto> shipmentsPage = backOfficeLogisticsService
                .getShipments(mainPage, status, carrier, q);
        Page<BackOfficeShipmentDto> deliveredPageResult = backOfficeLogisticsService
                .getShipments(historyPage, deliveredStatus, deliveredCarrier, deliveredQ);

        return BackOfficeLogisticsCollectionDto.builder()
                .kpis(backOfficeLogisticsService.getKpis(days))
                .appConfig(backOfficeSettingService.getShopProfile())
                .shipmentsPage(PageResponse.from(shipmentsPage))
                .deliveredPage(PageResponse.from(deliveredPageResult))
                .delivered(deliveredPageResult.getContent())
                .build();
    }

    @Override
    public BackOfficeDeliveryBootstrapDto getDeliveryBootstrap(
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
    ) {
        int resolvedSize = normalizeMainSize(size, limit);
        int activeLimit = normalizeLimit(limit, 8);

        PageRequest deliveriesPageRequest = PageRequest.of(Math.max(0, page), resolvedSize, resolveSort(sortKey));
        PageRequest deliveredPageRequest = PageRequest.of(
                Math.max(0, deliveredPage),
                normalizeSize(deliveredSize),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        PageRequest activePageRequest = PageRequest.of(0, activeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<BackOfficeShipmentDto> deliveriesPage = backOfficeLogisticsService
                .getShipments(deliveriesPageRequest, status, carrier, q);
        Page<BackOfficeShipmentDto> deliveredPageResult = backOfficeLogisticsService
                .getShipments(deliveredPageRequest, deliveredStatus, deliveredCarrier, deliveredQ);
        List<BackOfficeShipmentDto> activeShipments = backOfficeLogisticsService
                .getShipments(activePageRequest, ShipmentStatus.EN_COURS, carrier, q)
                .getContent();

        return BackOfficeDeliveryBootstrapDto.builder()
                .kpis(backOfficeLogisticsService.getKpis(days))
                .appConfig(backOfficeSettingService.getShopProfile())
                .activeShipments(activeShipments)
                .deliveriesPage(PageResponse.from(deliveriesPage))
                .deliveredPage(PageResponse.from(deliveredPageResult))
                .build();
    }

    @Override
    public BackOfficeShipmentDetailsCollectionDto getShipmentDetailsCollection(List<Long> ids) {
        List<Long> safeIds = normalizeIds(ids);
        if (safeIds.isEmpty()) {
            return BackOfficeShipmentDetailsCollectionDto.builder()
                    .shipments(List.of())
                    .missingIds(List.of())
                    .build();
        }

        List<BackOfficeShipmentDetailDto> details = backOfficeLogisticsService.getShipmentDetailsByIds(safeIds);
        Set<Long> foundIds = new LinkedHashSet<>();
        for (BackOfficeShipmentDetailDto detail : details) {
            if (detail != null && detail.getId() != null) {
                foundIds.add(detail.getId());
            }
        }
        List<Long> missingIds = new ArrayList<>();
        for (Long id : safeIds) {
            if (!foundIds.contains(id)) {
                missingIds.add(id);
            }
        }

        return BackOfficeShipmentDetailsCollectionDto.builder()
                .shipments(details)
                .missingIds(missingIds)
                .build();
    }

    private int normalizeMainSize(int size, Integer limit) {
        if (limit != null) {
            return normalizeLimit(limit, 20);
        }
        return normalizeSize(size);
    }

    private int normalizeSize(int size) {
        return Math.max(1, Math.min(size, 200));
    }

    private int normalizeLimit(Integer limit, int fallback) {
        if (limit == null) {
            return fallback;
        }
        return Math.max(1, Math.min(limit, 200));
    }

    private Sort resolveSort(String sortKey) {
        String normalized = sortKey == null ? "" : sortKey.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "createdat_asc", "created_at_asc", "createdat:asc", "created_at:asc" ->
                    Sort.by(Sort.Direction.ASC, "createdAt");
            case "eta_asc", "eta:asc" -> Sort.by(Sort.Direction.ASC, "eta");
            case "eta_desc", "eta:desc" -> Sort.by(Sort.Direction.DESC, "eta");
            case "status_asc", "status:asc" -> Sort.by(Sort.Direction.ASC, "status");
            case "status_desc", "status:desc" -> Sort.by(Sort.Direction.DESC, "status");
            case "", "createdat_desc", "created_at_desc", "createdat:desc", "created_at:desc" ->
                    Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        LinkedHashSet<Long> ordered = new LinkedHashSet<>();
        for (Long id : ids) {
            if (id != null && id > 0L) {
                ordered.add(id);
            }
        }
        return new ArrayList<>(ordered);
    }
}
