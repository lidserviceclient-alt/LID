package com.lifeevent.lid.backoffice.product.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.product.dto.BulkProductDeleteResponse;
import com.lifeevent.lid.backoffice.product.dto.BulkProductResult;
import com.lifeevent.lid.backoffice.product.dto.BulkProductResultItem;
import com.lifeevent.lid.backoffice.product.mapper.BackOfficeProductMapper;
import com.lifeevent.lid.backoffice.product.service.BackOfficeProductService;
import com.lifeevent.lid.cache.event.ProductCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.IntStream;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeProductServiceImpl implements BackOfficeProductService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final BackOfficeProductMapper backOfficeProductMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeProductDto> getAll(Pageable pageable) {
        return articleRepository.findAll(pageable).map(this::toDtoWithExtras);
    }

    @Override
    public BackOfficeProductDto create(BackOfficeProductDto dto) {
        normalizeImageFields(dto);
        Article entity = buildArticleForCreate(dto);
        Article saved = saveArticle(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(saved.getId() == null ? Set.of() : Set.of(saved.getId())));
        return toDtoWithExtras(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeProductDto getById(Long id) {
        return toDtoWithExtras(findArticleOrThrow(id));
    }

    @Override
    public BackOfficeProductDto update(Long id, BackOfficeProductDto dto) {
        normalizeImageFields(dto);
        Article entity = findArticleOrThrow(id);
        enrichExistingArticle(entity, dto);
        Article saved = saveArticle(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(saved.getId() == null ? Set.of() : Set.of(saved.getId())));
        return toDtoWithExtras(saved);
    }

    @Override
    public void delete(Long id) {
        Article entity = findArticleOrThrow(id);
        deactivateAndSave(entity);
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(entity.getId() == null ? Set.of() : Set.of(entity.getId())));
    }

    @Override
    public BulkProductResult bulkCreate(List<BackOfficeProductDto> dtos) {
        int total = dtos == null ? 0 : dtos.size();
        if (dtos == null || dtos.isEmpty()) {
            return BulkProductResult.builder()
                    .total(total)
                    .created(0)
                    .results(List.of())
                    .build();
        }

        List<PreparationOutcome> preparationOutcomes = IntStream.range(0, dtos.size())
                .mapToObj(i -> prepareBulkItem(i, dtos.get(i)))
                .toList();

        List<BulkPreparedItem> preparedItems = preparationOutcomes.stream()
                .map(PreparationOutcome::preparedItem)
                .filter(Objects::nonNull)
                .toList();

        List<BulkProductResultItem> results = new ArrayList<>(preparationOutcomes.stream()
                .map(PreparationOutcome::failureResult)
                .filter(Objects::nonNull)
                .toList());

        int created = persistPreparedItems(preparedItems, results);

        BulkProductResult result = BulkProductResult.builder()
                .total(total)
                .created(created)
                .results(results)
                .build();
        if (created > 0) {
            eventPublisher.publishEvent(new ProductCatalogChangedEvent(Set.of()));
        }
        return result;
    }

    @Override
    public BulkProductDeleteResponse bulkDelete(List<Long> ids) {
        List<Long> requested = sanitizeRequestedIds(ids);
        if (requested.isEmpty()) {
            return emptyBulkDeleteResponse();
        }

        List<Article> found = findAndArchiveArticles(requested);
        Set<Long> foundIds = extractFoundIds(found);
        List<String> notFoundIds = buildNotFoundIds(requested, foundIds);

        BulkProductDeleteResponse response = buildBulkDeleteResponse(requested.size(), found.size(), notFoundIds);
        if (!foundIds.isEmpty()) {
            eventPublisher.publishEvent(new ProductCatalogChangedEvent(foundIds));
        }
        return response;
    }

    private int persistPreparedItems(List<BulkPreparedItem> preparedItems, List<BulkProductResultItem> results) {
        if (preparedItems.isEmpty()) return 0;

        List<Article> entities = preparedItems.stream().map(BulkPreparedItem::entity).toList();
        try {
            List<Article> saved = articleRepository.saveAll(entities);
            applyStocksForSavedBatch(preparedItems, saved);
            IntStream.range(0, Math.min(preparedItems.size(), saved.size()))
                    .forEach(i -> results.add(buildBulkResultItem(
                            preparedItems.get(i).index(),
                            preparedItems.get(i).dto(),
                            true,
                            saved.get(i).getId(),
                            null
                    )));
            return preparedItems.size();
        } catch (Exception batchException) {
            log.warn("Bulk saveAll failed, fallback to per-item save. Cause: {}", batchException.getMessage());
            return persistPreparedItemsIndividually(preparedItems, results);
        }
    }

    private int persistPreparedItemsIndividually(List<BulkPreparedItem> preparedItems, List<BulkProductResultItem> results) {
        List<PersistOutcome> outcomes = preparedItems.stream()
                .map(this::persistSinglePreparedItem)
                .toList();
        results.addAll(outcomes.stream().map(PersistOutcome::result).toList());
        return (int) outcomes.stream().filter(PersistOutcome::success).count();
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
        dto.setStock(aggregateStock(entity.getId()));
        return dto;
    }

    private Article findArticleOrThrow(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id.toString()));
    }

    private Article buildArticleForCreate(BackOfficeProductDto dto) {
        Article entity = backOfficeProductMapper.toEntity(dto);
        enrichArticle(entity, dto);
        return entity;
    }

    private void enrichExistingArticle(Article entity, BackOfficeProductDto dto) {
        backOfficeProductMapper.updateEntityFromDto(dto, entity);
        enrichArticle(entity, dto);
    }

    private void enrichArticle(Article entity, BackOfficeProductDto dto) {
        applyStatus(entity, dto != null ? dto.getStatus() : null);
        applyDefaults(entity, dto);
        applyCategory(entity, dto);
    }

    private Article saveArticle(Article entity) {
        return articleRepository.save(entity);
    }

    private void deactivateAndSave(Article entity) {
        if (entity == null) return;
        entity.setStatus(ArticleStatus.ARCHIVED);
        saveArticle(entity);
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
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) return;
        entity.setCategories(new ArrayList<>(List.of(categoryOpt.get())));
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
        return stocks.stream()
                .filter(Objects::nonNull)
                .map(Stock::getQuantityAvailable)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }

    private void upsertStock(Article article, Integer stockValue) {
        if (article == null || stockValue == null) return;
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

    private void applyStocksForSavedBatch(List<BulkPreparedItem> preparedItems, List<Article> savedArticles) {
        List<Stock> toCreate = new ArrayList<>();
        IntStream.range(0, Math.min(preparedItems.size(), savedArticles.size()))
                .mapToObj(i -> new SavedBulkItem(savedArticles.get(i), preparedItems.get(i).dto()))
                .filter(item -> item.dto() != null && item.dto().getStock() != null)
                .forEach(item -> {
                    Integer stockValue = item.dto().getStock();
                    List<Stock> existing = stockRepository.findByArticleId(item.article().getId());
                    if (existing == null || existing.isEmpty()) {
                        toCreate.add(newStock(item.article(), stockValue));
                    } else {
                        Stock first = existing.get(0);
                        first.setQuantityAvailable(stockValue);
                        if (first.getQuantityReserved() == null) {
                            first.setQuantityReserved(0);
                        }
                        if (first.getLot() == null || first.getLot().isBlank()) {
                            first.setLot(item.article().getSku());
                        }
                        stockRepository.save(first);
                    }
                });
        if (!toCreate.isEmpty()) {
            stockRepository.saveAll(toCreate);
        }
    }

    private PreparationOutcome prepareBulkItem(int index, BackOfficeProductDto dto) {
        try {
            return new PreparationOutcome(new BulkPreparedItem(index, dto, buildArticleForCreate(dto)), null);
        } catch (Exception e) {
            log.warn("Bulk product prepare failed at index {}: {}", index, e.getMessage());
            return new PreparationOutcome(null, buildBulkResultItem(index, dto, false, e.getMessage()));
        }
    }

    private PersistOutcome persistSinglePreparedItem(BulkPreparedItem item) {
        try {
            Article saved = saveArticle(item.entity());
            upsertStock(saved, item.dto() != null ? item.dto().getStock() : null);
            return new PersistOutcome(true, buildBulkResultItem(item.index(), item.dto(), true, saved.getId(), null));
        } catch (Exception e) {
            log.warn("Bulk product save failed at index {}: {}", item.index(), e.getMessage());
            return new PersistOutcome(false, buildBulkResultItem(item.index(), item.dto(), false, e.getMessage()));
        }
    }

    private BulkProductResultItem buildBulkResultItem(int index, BackOfficeProductDto dto, boolean success, String errorMessage) {
        return BulkProductResultItem.builder()
                .index(index)
                .reference(dto != null ? dto.getSku() : null)
                .name(dto != null ? dto.getName() : null)
                .success(success)
                .productId(null)
                .errorMessage(errorMessage)
                .build();
    }

    private BulkProductResultItem buildBulkResultItem(
            int index,
            BackOfficeProductDto dto,
            boolean success,
            Long productId,
            String errorMessage
    ) {
        return BulkProductResultItem.builder()
                .index(index)
                .reference(dto != null ? dto.getSku() : null)
                .name(dto != null ? dto.getName() : null)
                .success(success)
                .productId(productId == null ? null : String.valueOf(productId))
                .errorMessage(errorMessage)
                .build();
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

    private List<Long> sanitizeRequestedIds(List<Long> ids) {
        if (ids == null) {
            return List.of();
        }
        return ids.stream()
                .filter(Objects::nonNull)
                .toList();
    }

    private BulkProductDeleteResponse emptyBulkDeleteResponse() {
        return BulkProductDeleteResponse.builder()
                .requested(0)
                .archived(0)
                .notFoundIds(List.of())
                .build();
    }

    private List<Article> findAndArchiveArticles(List<Long> requested) {
        List<Article> found = articleRepository.findAllById(requested);
        for (Article article : found) {
            if (article != null) {
                article.setStatus(ArticleStatus.ARCHIVED);
            }
        }
        articleRepository.saveAll(found);
        return found;
    }

    private Set<Long> extractFoundIds(List<Article> found) {
        Set<Long> foundIds = new HashSet<>();
        for (Article article : found) {
            if (article != null && article.getId() != null) {
                foundIds.add(article.getId());
            }
        }
        return foundIds;
    }

    private List<String> buildNotFoundIds(List<Long> requested, Set<Long> foundIds) {
        return requested.stream()
                .filter(id -> !foundIds.contains(id))
                .map(String::valueOf)
                .toList();
    }

    private BulkProductDeleteResponse buildBulkDeleteResponse(int requested, int archived, List<String> notFoundIds) {
        return BulkProductDeleteResponse.builder()
                .requested(requested)
                .archived(archived)
                .notFoundIds(notFoundIds)
                .build();
    }

    private Stock newStock(Article article, Integer stockValue) {
        return Stock.builder()
                .article(article)
                .quantityAvailable(stockValue)
                .quantityReserved(0)
                .lot(article.getSku())
                .build();
    }

    private record BulkPreparedItem(int index, BackOfficeProductDto dto, Article entity) {
    }

    private record PreparationOutcome(BulkPreparedItem preparedItem, BulkProductResultItem failureResult) {
    }

    private record PersistOutcome(boolean success, BulkProductResultItem result) {
    }

    private record SavedBulkItem(Article article, BackOfficeProductDto dto) {
    }
}
