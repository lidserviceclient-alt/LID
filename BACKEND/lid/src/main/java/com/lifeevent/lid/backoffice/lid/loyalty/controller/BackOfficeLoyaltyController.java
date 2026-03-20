package com.lifeevent.lid.backoffice.lid.loyalty.controller;

import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyAdjustPointsRequest;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCollectionDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyTransactionDto;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyCollectionService;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/loyalty", "/api/backoffice/loyalty"})
@RequiredArgsConstructor
public class BackOfficeLoyaltyController implements IBackOfficeLoyaltyController {

    private final BackOfficeLoyaltyService backOfficeLoyaltyService;
    private final BackOfficeLoyaltyCollectionService backOfficeLoyaltyCollectionService;

    @Override
    public ResponseEntity<BackOfficeLoyaltyCollectionDto> getCollection(String q, int page, int size, Integer topLimit) {
        return ResponseEntity.ok(backOfficeLoyaltyCollectionService.getCollection(q, page, size, topLimit));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyOverviewDto> getOverview() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getOverview());
    }

    @Override
    public ResponseEntity<List<BackOfficeLoyaltyTierDto>> getTiers() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getTiers());
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyTierDto> createTier(BackOfficeLoyaltyTierDto dto) {
        return ResponseEntity.ok(backOfficeLoyaltyService.createTier(dto));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyConfigDto> getConfig() {
        return ResponseEntity.ok(backOfficeLoyaltyService.getConfig());
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyConfigDto> updateConfig(BackOfficeLoyaltyConfigDto dto) {
        return ResponseEntity.ok(backOfficeLoyaltyService.updateConfig(dto));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyTierDto> updateTier(Long id, BackOfficeLoyaltyTierDto dto) {
        return ResponseEntity.ok(backOfficeLoyaltyService.updateTier(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteTier(Long id) {
        backOfficeLoyaltyService.deleteTier(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Page<BackOfficeLoyaltyCustomerDto>> getCustomers(String q, int page, int size, Integer limit) {
        if (limit != null) {
            List<BackOfficeLoyaltyCustomerDto> customers = backOfficeLoyaltyService.topCustomers(limit);
            PageRequest pageable = PageRequest.of(0, Math.max(1, customers.size()));
            return ResponseEntity.ok(new PageImpl<>(customers, pageable, customers.size()));
        }
        return ResponseEntity.ok(backOfficeLoyaltyService.searchCustomers(q, PageRequest.of(page, size)));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyCustomerDto> getCustomer(String userId) {
        return ResponseEntity.ok(backOfficeLoyaltyService.getCustomer(userId));
    }

    @Override
    public ResponseEntity<Page<BackOfficeLoyaltyTransactionDto>> getTransactions(String userId, int page, int size) {
        return ResponseEntity.ok(backOfficeLoyaltyService.getTransactions(userId, PageRequest.of(page, size)));
    }

    @Override
    public ResponseEntity<BackOfficeLoyaltyCustomerDto> adjustPoints(String userId, BackOfficeLoyaltyAdjustPointsRequest request) {
        return ResponseEntity.ok(backOfficeLoyaltyService.adjustPoints(userId, request));
    }
}
