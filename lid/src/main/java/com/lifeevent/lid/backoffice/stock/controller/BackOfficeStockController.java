package com.lifeevent.lid.backoffice.stock.controller;

import com.lifeevent.lid.backoffice.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.backoffice.stock.service.BackOfficeStockService;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({
        "/api/v1/backoffice/stocks",
        "/api/backoffice/stocks",
        "/api/v1/backoffice/stocks/movements",
        "/api/backoffice/stocks/movements"
})
@RequiredArgsConstructor
public class BackOfficeStockController implements IBackOfficeStockController {

    private final BackOfficeStockService backOfficeStockService;

    @Override
    public ResponseEntity<Page<BackOfficeStockMovementDto>> getMovements(int page, int size, String sku, StockMovementType type) {
        return ResponseEntity.ok(backOfficeStockService.getMovements(PageRequest.of(page, size), sku, type));
    }

    @Override
    public ResponseEntity<BackOfficeStockMovementDto> createMovement(CreateStockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeStockService.createMovement(request));
    }
}
