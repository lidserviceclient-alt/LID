package com.lifeevent.lid.stock.controller;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.dto.StockDto;
import com.lifeevent.lid.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/stocks")
public class StockController implements IStockController {
    private final StockService stockService;

    @Override
    public ResponseEntity<StockDto> getStock(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getStockById(id)
                .orElseThrow(() -> new ResourceNotFoundException("stock", "id", id.toString())));
    }

    @Override
    public ResponseEntity<Page<StockDto>> getAllStocks(int page, int size) {
        return ResponseEntity.ok(stockService.getAllStocks(PageRequest.of(page, size)));
    }

    @Override
    public ResponseEntity<Page<StockDto>> getStocksByArticle(Long articleId, int page, int size) {
        return ResponseEntity.ok(stockService.getStocksByArticleId(articleId, PageRequest.of(page, size)));
    }
}
