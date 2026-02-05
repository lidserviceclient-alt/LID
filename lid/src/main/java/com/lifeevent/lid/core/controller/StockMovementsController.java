package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateStockMovementRequest;
import com.lifeevent.lid.core.dto.StockMovementDto;
import com.lifeevent.lid.core.enums.TypeMouvementStock;
import com.lifeevent.lid.core.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/backoffice/stocks/movements")
public class StockMovementsController {

    private final StockMovementService stockMovementService;

    public StockMovementsController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public Page<StockMovementDto> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "type", required = false) TypeMouvementStock type
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return stockMovementService.listMovements(sku, type, pageable);
    }

    @PostMapping
    public StockMovementDto create(@Valid @RequestBody CreateStockMovementRequest request) {
        return stockMovementService.createMovement(request);
    }
}
