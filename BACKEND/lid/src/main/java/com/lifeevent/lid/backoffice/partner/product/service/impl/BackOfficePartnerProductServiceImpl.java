package com.lifeevent.lid.backoffice.partner.product.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.mapper.BackOfficeProductMapper;
import com.lifeevent.lid.backoffice.partner.product.service.BackOfficePartnerProductService;
import com.lifeevent.lid.cache.event.ProductCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.Set;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficePartnerProductServiceImpl implements BackOfficePartnerProductService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final BackOfficeProductMapper backOfficeProductMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeProductDto> getMyProducts(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return articleRepository.findByReferencePartner(partnerId, pageable).map(this::toDtoWithExtras);
    }

    @Override
    public BackOfficeProductDto createMyProduct(BackOfficeProductDto dto) {
        String partnerId = requireCurrentPartnerId();
        normalizeImageFields(dto);
        Article entity = backOfficeProductMapper.toEntity(dto);
        enrichArticle(entity, dto);
        entity.setReferencePartner(partnerId);
        Article saved = articleRepository.save(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(saved.getId() == null ? Set.of() : Set.of(saved.getId())));
        return toDtoWithExtras(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeProductDto getMyProduct(Long id) {
        return toDtoWithExtras(findOwnedOrThrow(id));
    }

    @Override
    public BackOfficeProductDto updateMyProduct(Long id, BackOfficeProductDto dto) {
        normalizeImageFields(dto);
        Article entity = findOwnedOrThrow(id);
        backOfficeProductMapper.updateEntityFromDto(dto, entity);
        enrichArticle(entity, dto);
        Article saved = articleRepository.save(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(saved.getId() == null ? Set.of() : Set.of(saved.getId())));
        return toDtoWithExtras(saved);
    }

    @Override
    public void deleteMyProduct(Long id) {
        Article entity = findOwnedOrThrow(id);
        entity.setStatus(ArticleStatus.ARCHIVED);
        Article saved = articleRepository.save(entity);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(saved.getId() == null ? Set.of() : Set.of(saved.getId())));
    }

    private Article findOwnedOrThrow(Long id) {
        String partnerId = requireCurrentPartnerId();
        return articleRepository.findByIdAndReferencePartner(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id == null ? "" : String.valueOf(id)));
    }

    private BackOfficeProductDto toDtoWithExtras(Article entity) {
        BackOfficeProductDto dto = backOfficeProductMapper.toDto(entity);
        dto.setImg(entity != null ? entity.getImg() : null);
        dto.setImageUrl(entity != null ? entity.getImg() : null);
        dto.setStatus(toBackOfficeStatus(entity != null ? entity.getStatus() : null));
        Category cat = resolvePrimaryCategory(entity);
        if (cat != null) {
            dto.setCategoryId(cat.getId() != null ? String.valueOf(cat.getId()) : null);
            dto.setCategory(cat.getName());
        }
        dto.setStock(aggregateStock(entity != null ? entity.getId() : null));
        return dto;
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
        return stocks.stream()
                .filter(Objects::nonNull)
                .map(Stock::getQuantityAvailable)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }

    private void upsertStock(Article article, Integer stockValue) {
        if (article == null || article.getId() == null || stockValue == null) return;
        List<Stock> stocks = stockRepository.findByArticleId(article.getId());
        if (stocks == null || stocks.isEmpty()) {
            stockRepository.save(newStock(article, stockValue));
            return;
        }
        Stock stock = stocks.get(0);
        stock.setQuantityAvailable(stockValue);
        if (stock.getQuantityReserved() == null) {
            stock.setQuantityReserved(0);
        }
        if (stock.getLot() == null || stock.getLot().isBlank()) {
            stock.setLot(article.getSku());
        }
        stockRepository.save(stock);
    }

    private Stock newStock(Article article, Integer stockValue) {
        return Stock.builder()
                .article(article)
                .quantityAvailable(Math.max(0, stockValue))
                .quantityReserved(0)
                .lot(article.getSku())
                .build();
    }

    private void enrichArticle(Article entity, BackOfficeProductDto dto) {
        applyStatus(entity, dto != null ? dto.getStatus() : null);
        applyDefaults(entity, dto);
        applyCategory(entity, dto);
    }

    private void applyDefaults(Article entity, BackOfficeProductDto dto) {
        if (entity == null) return;
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

    private void applyStatus(Article entity, String rawStatus) {
        ArticleStatus parsed = parseStatus(rawStatus);
        if (parsed != null) {
            entity.setStatus(parsed);
        }
    }

    private ArticleStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.trim().isEmpty()) {
            return null;
        }
        return switch (rawStatus.trim().toUpperCase()) {
            case "ACTIVE", "ACTIF" -> ArticleStatus.ACTIVE;
            case "DRAFT", "BROUILLON" -> ArticleStatus.DRAFT;
            case "ARCHIVED", "ARCHIVE" -> ArticleStatus.ARCHIVED;
            default -> null;
        };
    }

    private String toBackOfficeStatus(ArticleStatus status) {
        if (status == null) return "ACTIF";
        return switch (status) {
            case ACTIVE -> "ACTIF";
            case DRAFT -> "BROUILLON";
            case ARCHIVED -> "ARCHIVE";
        };
    }

    private void applyCategory(Article entity, BackOfficeProductDto dto) {
        Integer categoryId = parseCategoryId(dto);
        if (categoryId == null) return;
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", String.valueOf(categoryId)));
        entity.setCategories(List.of(category));
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

    private void normalizeImageFields(BackOfficeProductDto dto) {
        if (dto == null) {
            return;
        }
        if ((dto.getImg() == null || dto.getImg().isBlank()) && dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            dto.setImg(dto.getImageUrl());
        }
        if ((dto.getImageUrl() == null || dto.getImageUrl().isBlank()) && dto.getImg() != null && !dto.getImg().isBlank()) {
            dto.setImageUrl(dto.getImg());
        }
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }
}

