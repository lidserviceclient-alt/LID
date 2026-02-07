package com.lifeevent.lid.backoffice.product.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.product.dto.BulkProductResult;
import com.lifeevent.lid.backoffice.product.dto.BulkProductResultItem;
import com.lifeevent.lid.backoffice.product.mapper.BackOfficeProductMapper;
import com.lifeevent.lid.backoffice.product.service.BackOfficeProductService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeProductServiceImpl implements BackOfficeProductService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final BackOfficeProductMapper backOfficeProductMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeProductDto> getAll(Pageable pageable) {
        return articleRepository.findAll(pageable).map(this::toDtoWithExtras);
    }

    @Override
    public BackOfficeProductDto create(BackOfficeProductDto dto) {
        Article entity = backOfficeProductMapper.toEntity(dto);
        applyDefaults(entity, dto);
        applyCategory(entity, dto);
        Article saved = articleRepository.save(entity);
        applyStock(saved, dto);
        return toDtoWithExtras(saved);
    }

    @Override
    public BackOfficeProductDto update(Long id, BackOfficeProductDto dto) {
        Article entity = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id.toString()));

        backOfficeProductMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity, dto);
        applyCategory(entity, dto);
        Article saved = articleRepository.save(entity);
        applyStock(saved, dto);
        return toDtoWithExtras(saved);
    }

    @Override
    public void delete(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article", "id", id.toString());
        }
        articleRepository.deleteById(id);
    }

    @Override
    public BulkProductResult bulkCreate(List<BackOfficeProductDto> dtos) {
        List<BulkProductResultItem> results = new ArrayList<>();
        int created = 0;
        int total = dtos == null ? 0 : dtos.size();
        if (dtos != null) {
            for (int i = 0; i < dtos.size(); i++) {
                BackOfficeProductDto dto = dtos.get(i);
                try {
                    create(dto);
                    created++;
                    results.add(BulkProductResultItem.builder()
                            .index(i)
                            .reference(dto != null ? dto.getSku() : null)
                            .name(dto != null ? dto.getName() : null)
                            .success(true)
                            .build());
                } catch (Exception e) {
                    log.warn("Bulk product create failed at index {}: {}", i, e.getMessage());
                    results.add(BulkProductResultItem.builder()
                            .index(i)
                            .reference(dto != null ? dto.getSku() : null)
                            .name(dto != null ? dto.getName() : null)
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
                }
            }
        }
        return BulkProductResult.builder()
                .total(total)
                .created(created)
                .results(results)
                .build();
    }

    @Override
    public void bulkDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        articleRepository.deleteAllById(ids);
    }

    private BackOfficeProductDto toDtoWithExtras(Article entity) {
        BackOfficeProductDto dto = backOfficeProductMapper.toDto(entity);
        Category cat = resolvePrimaryCategory(entity);
        if (cat != null) {
            dto.setCategoryId(cat.getId() != null ? String.valueOf(cat.getId()) : null);
            dto.setCategory(cat.getName());
        }
        dto.setStock(aggregateStock(entity.getId()));
        return dto;
    }

    private void applyDefaults(Article entity, BackOfficeProductDto dto) {
        if (entity.getStatus() == null) {
            entity.setStatus(ArticleStatus.ACTIVE);
        }
        if (entity.getPrice() == null && dto != null && dto.getPrice() != null) {
            entity.setPrice(dto.getPrice());
        }
        if (entity.getSku() == null && dto != null) {
            entity.setSku(dto.getSku());
        }
    }

    private void applyCategory(Article entity, BackOfficeProductDto dto) {
        Integer categoryId = parseCategoryId(dto);
        if (categoryId == null) return;
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) return;
        entity.setCategories(List.of(categoryOpt.get()));
    }

    private Integer parseCategoryId(BackOfficeProductDto dto) {
        if (dto == null) return null;
        String raw = dto.getCategoryId();
        if (raw == null || raw.trim().isEmpty()) {
            raw = dto.getCategory();
        }
        if (raw == null || raw.trim().isEmpty()) return null;
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Category resolvePrimaryCategory(Article entity) {
        if (entity == null || entity.getCategories() == null || entity.getCategories().isEmpty()) {
            return null;
        }
        return entity.getCategories().get(0);
    }

    private Integer aggregateStock(Long articleId) {
        if (articleId == null) return 0;
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

    private void applyStock(Article article, BackOfficeProductDto dto) {
        if (article == null || dto == null || dto.getStock() == null) return;
        List<Stock> stocks = stockRepository.findByArticleId(article.getId());
        if (stocks == null || stocks.isEmpty()) {
            Stock stock = Stock.builder()
                    .article(article)
                    .quantityAvailable(dto.getStock())
                    .quantityReserved(0)
                    .lot(article.getSku())
                    .build();
            stockRepository.save(stock);
            return;
        }
        Stock stock = stocks.get(0);
        stock.setQuantityAvailable(dto.getStock());
        stockRepository.save(stock);
    }
}
