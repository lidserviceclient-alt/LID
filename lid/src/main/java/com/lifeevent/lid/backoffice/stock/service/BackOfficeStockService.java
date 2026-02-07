package com.lifeevent.lid.backoffice.stock.service;

import com.lifeevent.lid.backoffice.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeStockService {
    Page<BackOfficeStockMovementDto> getMovements(Pageable pageable, String sku, StockMovementType type);
    BackOfficeStockMovementDto createMovement(CreateStockMovementRequest request);
}
