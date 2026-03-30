package com.lifeevent.lid.backoffice.lid.stock.controller;

import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeInventoryCollectionDto;
import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.lid.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.backoffice.lid.stock.service.BackOfficeStockService;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/backoffice/stocks")
@RequiredArgsConstructor
public class BackOfficeStockController implements IBackOfficeStockController {

    private final BackOfficeStockService backOfficeStockService;

    @Override
    public ResponseEntity<BackOfficeInventoryCollectionDto> getCollection(
            int productsPage,
            int productsSize,
            int movementsPage,
            int movementsSize,
            String sku,
            StockMovementType type
    ) {
        return ResponseEntity.ok(backOfficeStockService.getCollection(
                productsPage,
                productsSize,
                movementsPage,
                movementsSize,
                sku,
                type
        ));
    }

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeStockMovementDto>> getMovements(int page, int size, String sku, StockMovementType type) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeStockService.getMovements(PageRequest.of(page, size), sku, type)));
    }

    @Override
    public ResponseEntity<BackOfficeStockMovementDto> createMovement(CreateStockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeStockService.createMovement(request));
    }
}
