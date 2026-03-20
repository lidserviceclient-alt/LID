package com.lifeevent.lid.backoffice.lid.stock.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.backoffice.lid.stock.dto.CreateStockMovementRequest;
import com.lifeevent.lid.backoffice.lid.stock.mapper.BackOfficeStockMovementMapper;
import com.lifeevent.lid.backoffice.lid.stock.service.BackOfficeStockService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.entity.StockMovement;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import com.lifeevent.lid.stock.repository.StockMovementRepository;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeStockServiceImpl implements BackOfficeStockService {

    private final StockMovementRepository stockMovementRepository;
    private final StockRepository stockRepository;
    private final ArticleRepository articleRepository;
    private final BackOfficeStockMovementMapper backOfficeStockMovementMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeStockMovementDto> getMovements(Pageable pageable, String sku, StockMovementType type) {
        return stockMovementRepository.search(sku, type, pageable)
                .map(backOfficeStockMovementMapper::toDto);
    }

    @Override
    public BackOfficeStockMovementDto createMovement(CreateStockMovementRequest request) {
        if (request == null || request.getProductId() == null) {
            throw new IllegalArgumentException("productId requis");
        }
        Article article = articleRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", request.getProductId().toString()));

        StockMovementType type = request.getType();
        if (type == null) throw new IllegalArgumentException("type requis");

        int stockBefore = computeTotalAvailable(article.getId());
        int stockAfter = stockBefore;
        int quantity = 0;

        if (type == StockMovementType.AJUSTEMENT) {
            Integer newStock = request.getNewStock();
            if (newStock == null || newStock < 0) {
                throw new IllegalArgumentException("newStock invalide");
            }
            quantity = Math.abs(newStock - stockBefore);
            stockAfter = newStock;
        } else {
            Integer qty = request.getQuantity();
            if (qty == null || qty <= 0) {
                throw new IllegalArgumentException("quantity invalide");
            }
            quantity = Math.abs(qty);
            if (type == StockMovementType.ENTREE) {
                stockAfter = stockBefore + quantity;
            } else if (type == StockMovementType.SORTIE) {
                stockAfter = stockBefore - quantity;
                if (stockAfter < 0) {
                    throw new IllegalArgumentException("Stock insuffisant pour cette sortie");
                }
            }
        }

        applyStockUpdate(article, stockAfter);

        StockMovement movement = StockMovement.builder()
                .article(article)
                .type(type)
                .quantity(quantity)
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .reference(request.getReference())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        return backOfficeStockMovementMapper.toDto(saved);
    }

    private int computeTotalAvailable(Long articleId) {
        List<Stock> stocks = stockRepository.findByArticleId(articleId);
        if (stocks == null || stocks.isEmpty()) return 0;
        int total = 0;
        for (Stock s : stocks) {
            if (s != null && s.getQuantityAvailable() != null) {
                total += s.getQuantityAvailable();
            }
        }
        return total;
    }

    private void applyStockUpdate(Article article, int newAvailable) {
        List<Stock> stocks = stockRepository.findByArticleId(article.getId());
        if (stocks == null || stocks.isEmpty()) {
            Stock stock = Stock.builder()
                    .article(article)
                    .quantityAvailable(newAvailable)
                    .quantityReserved(0)
                    .lot(article.getSku())
                    .build();
            stockRepository.save(stock);
            return;
        }
        Stock target = stocks.get(0);
        target.setQuantityAvailable(newAvailable);
        stockRepository.save(target);
    }
}
