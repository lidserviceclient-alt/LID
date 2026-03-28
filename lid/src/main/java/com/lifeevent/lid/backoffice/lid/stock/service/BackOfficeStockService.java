package com.lifeevent.lid.backoffice.lid.stock.service;

import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeInventoryCollectionDto;
import com.lifeevent.lid.backoffice.lid.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeStockService {
    BackOfficeInventoryCollectionDto getCollection(
            int productsPage,
            int productsSize,
            int movementsPage,
            int movementsSize,
            String sku,
            StockMovementType type
    );
    Page<BackOfficeStockMovementDto> getMovements(Pageable pageable, String sku, StockMovementType type);
    BackOfficeStockMovementDto createMovement(CreateStockMovementRequest request);
}
