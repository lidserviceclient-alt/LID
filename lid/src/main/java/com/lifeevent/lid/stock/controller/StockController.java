package com.lifeevent.lid.stock.controller;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.dto.StockDto;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stocks")
public class StockController implements IStockController {
    private final StockRepository stockRepository;

    @Override
    public ResponseEntity<StockDto> getStock(@PathVariable Long id) {
        return ResponseEntity.ok(stockRepository.findById(id)
                .map(stock -> StockDto.builder().lot(stock.getLot()).bestBefore(stock.getBestBefore()).build())
                .orElseThrow(() -> new ResourceNotFoundException("stock", "id", id.toString())));
    }
}
