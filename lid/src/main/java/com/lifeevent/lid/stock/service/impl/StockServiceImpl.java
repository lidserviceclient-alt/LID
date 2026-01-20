package com.lifeevent.lid.stock.service.impl;

import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.dto.StockDto;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.mapper.StockMapper;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StockServiceImpl implements StockService {
    
    private final StockRepository stockRepository;
    private final ArticleRepository articleRepository;
    private final StockMapper stockMapper;
    
    @Override
    public StockDto createStock(StockDto dto) {
        log.info("Création d'un stock pour l'article: {}", dto.getArticleId());
        
        // Vérifier que l'article existe
        articleRepository.findById(dto.getArticleId())
            .orElseThrow(() -> new ResourceNotFoundException("Article", "id", dto.getArticleId().toString()));
        
        Stock stock = stockMapper.toEntity(dto);
        Stock saved = stockRepository.save(stock);
        return stockMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<StockDto> getStockById(Long id) {
        return stockRepository.findById(id).map(stockMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockDto> getAllStocks() {
        return stockMapper.toDtoList(stockRepository.findAll());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockDto> getStocksByArticleId(Long articleId) {
        log.info("Récupération des stocks pour l'article: {}", articleId);
        return stockMapper.toDtoList(stockRepository.findByArticleId(articleId));
    }
    
    @Override
    public StockDto updateStock(Long id, StockDto dto) {
        log.info("Mise à jour du stock: {}", id);
        Stock stock = stockRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", "id", id.toString()));
        
        stockMapper.updateEntityFromDto(dto, stock);
        Stock updated = stockRepository.save(stock);
        return stockMapper.toDto(updated);
    }
    
    @Override
    public void deleteStock(Long id) {
        log.info("Suppression du stock: {}", id);
        if (!stockRepository.existsById(id)) {
            throw new ResourceNotFoundException("Stock", "id", id.toString());
        }
        stockRepository.deleteById(id);
    }
    
    @Override
    public void reserveQuantity(Long stockId, Integer quantity) {
        log.info("Réservation de {} unités du stock: {}", quantity, stockId);
        
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", "id", stockId.toString()));
        
        if (stock.getQuantityAvailable() < quantity) {
            throw new IllegalArgumentException("Quantité insuffisante en stock");
        }
        
        stock.setQuantityAvailable(stock.getQuantityAvailable() - quantity);
        stock.setQuantityReserved(stock.getQuantityReserved() + quantity);
        stockRepository.save(stock);
    }
    
    @Override
    public void cancelReservation(Long stockId, Integer quantity) {
        log.info("Annulation de la réservation de {} unités du stock: {}", quantity, stockId);
        
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", "id", stockId.toString()));
        
        if (stock.getQuantityReserved() < quantity) {
            throw new IllegalArgumentException("Quantité réservée insuffisante");
        }
        
        stock.setQuantityAvailable(stock.getQuantityAvailable() + quantity);
        stock.setQuantityReserved(stock.getQuantityReserved() - quantity);
        stockRepository.save(stock);
    }
    
    @Override
    public void confirmSale(Long stockId, Integer quantity) {
        log.info("Confirmation de la vente de {} unités du stock: {}", quantity, stockId);
        
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", "id", stockId.toString()));
        
        if (stock.getQuantityReserved() < quantity) {
            throw new IllegalArgumentException("Quantité réservée insuffisante");
        }
        
        stock.setQuantityReserved(stock.getQuantityReserved() - quantity);
        stockRepository.save(stock);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Integer getAvailableQuantity(Long stockId) {
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", "id", stockId.toString()));
        
        return stock.getQuantityAvailable();
    }
}
