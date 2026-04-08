package com.lifeevent.lid.catalog.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.blog.dto.BlogPostDto;
import com.lifeevent.lid.blog.entity.BlogPost;
import com.lifeevent.lid.blog.repository.BlogPostRepository;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.common.cache.event.ReviewCatalogChangedEvent;
import com.lifeevent.lid.catalog.dto.*;
import com.lifeevent.lid.catalog.mapper.CatalogMapper;
import com.lifeevent.lid.catalog.service.CatalogService;
import com.lifeevent.lid.catalog.service.PartnerCatalogService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.review.entity.ProductReview;
import com.lifeevent.lid.review.entity.ProductReviewLike;
import com.lifeevent.lid.review.entity.ProductReviewReport;
import com.lifeevent.lid.review.repository.ProductReviewLikeRepository;
import com.lifeevent.lid.review.repository.ProductReviewReportRepository;
import com.lifeevent.lid.review.repository.ProductReviewRepository;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.ticket.dto.TicketEventDto;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final ProductReviewRepository productReviewRepository;
    private final ProductReviewLikeRepository productReviewLikeRepository;
    private final ProductReviewReportRepository productReviewReportRepository;
    private final UserEntityRepository userEntityRepository;
    private final UserService userService;
    private final CustomerRepository customerRepository;
    private final BlogPostRepository blogPostRepository;
    private final TicketEventRepository ticketEventRepository;
    private final CatalogMapper catalogMapper;
    private final PartnerCatalogService partnerCatalogService;
    private final ApplicationEventPublisher eventPublisher;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    @Transactional(readOnly = true)
    public Page<CatalogProductDto> listProducts(int page, int size, String q, String category, String sortKey) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), resolveSort(sortKey));
        log.info("pageable: {}", pageable);
        
        SearchPayload payload = buildSearchPayload(q, category);
        log.info("Listing products with filters: page={}, size={}, q={}, category={}, sortKey={}, payload={}", page, size, q, category, sortKey, payload);
        Page<Article> articles = (payload.queryEmpty() && payload.tokensEmpty())
                ? articleRepository.findByStatus(ArticleStatus.ACTIVE, pageable)
                : articleRepository.searchCatalog(
                ArticleStatus.ACTIVE,
                payload.queryPattern(),
                payload.queryEmpty(),
                payload.tokensEmpty(),
                payload.categoryTokens(),
                pageable
        );
        return toCatalogProductPage(articles);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.FEATURED_PRODUCTS,
            key = "@cacheScopeVersionService.catalogVersion() + ':' + (#limit == null ? 12 : #limit)",
            sync = true
    )
    public List<CatalogProductDto> listFeaturedProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 12);
        List<Article> articles = articleRepository
                .findByIsFeaturedTrueAndStatusOrderByUpdatedAtDesc(ArticleStatus.ACTIVE, PageRequest.of(0, safeLimit))
                .getContent();
        return toCatalogProductList(articles);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.BESTSELLER_PRODUCTS,
            key = "@cacheScopeVersionService.catalogVersion() + ':' + (#limit == null ? 12 : #limit)",
            sync = true
    )
    public List<CatalogProductDto> listBestSellerProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 12);
        List<Article> articles = articleRepository
                .findByIsBestSellerTrueAndStatusOrderByUpdatedAtDesc(ArticleStatus.ACTIVE, PageRequest.of(0, safeLimit))
                .getContent();
        return toCatalogProductList(articles);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.LATEST_PRODUCTS,
            key = "@cacheScopeVersionService.catalogVersion() + ':' + (#limit == null ? 20 : #limit)",
            sync = true
    )
    public List<CatalogProductDto> listLatestProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 20);
        List<Article> articles = articleRepository.findNewArticles(PageRequest.of(0, safeLimit)).getContent();
        return toCatalogProductList(articles);
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogProductDto getProduct(String idOrReference) {
        Article article = resolveActiveArticleOrThrow(idOrReference);
        return toCatalogProductDto(article);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.PRODUCT_DETAILS,
            key = "@cacheScopeVersionService.productGlobalVersion() + ':id:' + #id",
            sync = true
    )
    public CatalogProductDetailsDto getProductDetails(Long id) {
        Article article = getActiveArticleOrThrow(id);
        List<String> images = buildProductImages(article);
        return catalogMapper.toCatalogProductDetailsDto(article, computeStock(article.getId()), images);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.PRODUCT_DETAILS,
            key = "@cacheScopeVersionService.productGlobalVersion() + ':ref:' + #idOrReference",
            sync = true
    )
    public CatalogProductDetailsDto getProductDetails(String idOrReference) {
        Article article = resolveActiveArticleOrThrow(idOrReference);
        List<String> images = buildProductImages(article);
        return catalogMapper.toCatalogProductDetailsDto(article, computeStock(article.getId()), images);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CatalogCacheNames.CATEGORIES, key = "'v:' + @cacheScopeVersionService.catalogVersion()", sync = true)
    public List<CatalogCategoryDto> listCategories() {
        return categoryRepository.findAllByOrderByOrderIdxAsc().stream()
                .filter(this::isActiveCategory)
                .map(category -> catalogMapper.toCatalogCategoryDto(category, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.FEATURED_CATEGORIES,
            key = "@cacheScopeVersionService.catalogVersion() + ':' + (#limit == null ? 12 : #limit)",
            sync = true
    )
    public List<CatalogCategoryDto> listFeaturedCategories(Integer limit) {
        int safeLimit = safeLimit(limit, 12);
        return categoryRepository.findAllByOrderByOrderIdxAsc().stream()
                .filter(this::isActiveCategory)
                .sorted(Comparator.comparing(category -> category.getOrderIdx() == null ? Integer.MAX_VALUE : category.getOrderIdx()))
                .limit(safeLimit)
                .map(category -> catalogMapper.toCatalogCategoryDto(category, true))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.PRODUCT_REVIEWS,
            key = "@cacheScopeVersionService.reviewVersionToken(#productId) + ':' + #productId + ':' + #page + ':' + #size",
            sync = true
    )
    public ProductReviewsResponse listProductReviews(Long productId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        CompletableFuture<Page<ProductReview>> resultFuture = supplyCatalogAsync(() -> productReviewRepository.findPublicByArticleId(
                productId,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
        CompletableFuture<Double> avgRatingFuture = supplyCatalogAsync(
                () -> normalizeDouble(productReviewRepository.avgPublicRatingByArticleId(productId))
        );
        CompletableFuture<Long> reviewCountFuture = supplyCatalogAsync(
                () -> productReviewRepository.countPublicByArticleId(productId)
        );

        CompletableFuture.allOf(resultFuture, avgRatingFuture, reviewCountFuture).join();

        Page<ProductReview> result = resultFuture.join();

        String currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;
        Set<Long> likedByMe = findLikedReviewIds(currentUserId, result.getContent());

        double avgRating = avgRatingFuture.join();
        long reviewCount = reviewCountFuture.join();

        List<ProductReviewDto> content = result.getContent().stream()
                .map(review -> catalogMapper.toProductReviewDto(review, likedByMe.contains(review.getId())))
                .toList();

        return new ProductReviewsResponse(
                avgRating,
                reviewCount,
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public ProductReviewDto upsertReview(Long productId, CreateProductReviewRequest request) {
        String userId = requireCurrentUserId();
        Article article = findArticleOrThrow(productId);
        UserEntity user = findUserOrThrow(userId);
        Customer customer = ensureCustomer(user);

        ProductReview review = productReviewRepository.findByArticleIdAndCustomerUserId(productId, userId)
                .orElseGet(() -> ProductReview.builder().article(article).customer(customer).build());

        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());
        review.setValidated(true);
        review.setDeletedAt(null);

        ProductReview saved = productReviewRepository.save(review);
        boolean likedByMe = productReviewLikeRepository.findByReviewIdAndUserUserId(saved.getId(), userId).isPresent();
        eventPublisher.publishEvent(new ReviewCatalogChangedEvent(Set.of(productId)));
        return catalogMapper.toProductReviewDto(saved, likedByMe);
    }

    @Override
    public void deleteReview(Long reviewId) {
        String userId = requireCurrentUserId();
        ProductReview review = findReviewOrThrow(reviewId);
        boolean isOwner = review.getCustomer() != null && userId.equals(review.getCustomer().getUserId());
        if (!isOwner && !SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(FORBIDDEN);
        }
        review.setDeletedAt(LocalDateTime.now());
        productReviewRepository.save(review);
        Long productId = review.getArticle() == null ? null : review.getArticle().getId();
        eventPublisher.publishEvent(new ReviewCatalogChangedEvent(productId == null ? Set.of() : Set.of(productId)));
    }

    @Override
    public long toggleLike(Long reviewId) {
        String userId = requireCurrentUserId();
        UserEntity user = findUserOrThrow(userId);
        ProductReview review = findReviewOrThrow(reviewId);
        if (review.getDeletedAt() != null) {
            throw new ResponseStatusException(NOT_FOUND);
        }

        ProductReviewLike existing = productReviewLikeRepository.findByReviewIdAndUserUserId(reviewId, userId).orElse(null);
        if (existing != null) {
            productReviewLikeRepository.delete(existing);
            review.setLikeCount(Math.max(0L, safeLong(review.getLikeCount()) - 1));
        } else {
            ProductReviewLike like = ProductReviewLike.builder().review(review).user(user).build();
            productReviewLikeRepository.save(like);
            review.setLikeCount(safeLong(review.getLikeCount()) + 1);
        }

        productReviewRepository.save(review);
        Long productId = review.getArticle() == null ? null : review.getArticle().getId();
        eventPublisher.publishEvent(new ReviewCatalogChangedEvent(productId == null ? Set.of() : Set.of(productId)));
        return safeLong(review.getLikeCount());
    }

    @Override
    public void reportReview(Long reviewId, ReportProductReviewRequest request) {
        String userId = requireCurrentUserId();
        UserEntity user = findUserOrThrow(userId);
        ProductReview review = findReviewOrThrow(reviewId);
        if (review.getDeletedAt() != null) {
            throw new ResponseStatusException(NOT_FOUND);
        }

        if (productReviewReportRepository.findByReviewIdAndUserUserId(reviewId, userId).isPresent()) {
            return;
        }

        ProductReviewReport report = ProductReviewReport.builder()
                .review(review)
                .user(user)
                .reason(request.getReason().trim().toUpperCase(Locale.ROOT))
                .details(normalizeBlank(request.getDetails()))
                .build();
        productReviewReportRepository.save(report);

        review.setReportCount(safeLong(review.getReportCount()) + 1);
        productReviewRepository.save(review);
        Long productId = review.getArticle() == null ? null : review.getArticle().getId();
        eventPublisher.publishEvent(new ReviewCatalogChangedEvent(productId == null ? Set.of() : Set.of(productId)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.COLLECTION,
            key = "'v:' + @cacheScopeVersionService.catalogVersion()",
            sync = true,
            condition = "(#q == null || #q.isBlank()) && (#category == null || #category.isBlank())"
    )
    public CatalogCollectionDto getCollection(
            Integer featuredLimit,
            Integer bestSellerLimit,
            Integer latestLimit,
            Integer featuredCategoryLimit,
            Integer postsLimit,
            Integer ticketsLimit,
            int partnersPage,
            int partnersSize,
            String partnersQ,
            int page,
            int size,
            String q,
            String category,
            String sortKey
    ) {
        CompletableFuture<List<CatalogCategoryDto>> categoriesFuture = supplyCatalogAsync(this::listCategories);
        CompletableFuture<List<CatalogCategoryDto>> featuredCategoriesFuture =
                supplyCatalogAsync(() -> listFeaturedCategories(featuredCategoryLimit));
        CompletableFuture<List<CatalogProductDto>> featuredProductsFuture =
                supplyCatalogAsync(() -> listFeaturedProducts(featuredLimit));
        CompletableFuture<List<CatalogProductDto>> bestSellerProductsFuture =
                supplyCatalogAsync(() -> listBestSellerProducts(bestSellerLimit));
        CompletableFuture<List<CatalogProductDto>> latestProductsFuture =
                supplyCatalogAsync(() -> listLatestProducts(latestLimit));
        CompletableFuture<Page<CatalogProductDto>> productsPageFuture =
                supplyCatalogAsync(() -> listProducts(page, size, q, category, sortKey));
        CompletableFuture<Page<PartnerCatalogPartnerDto>> partnersPageFuture =
                supplyCatalogAsync(() -> partnerCatalogService.listPartners(partnersPage, partnersSize, partnersQ));
        CompletableFuture<List<BlogPostDto>> postsFuture = supplyCatalogAsync(() -> listRecentPosts(postsLimit));
        CompletableFuture<List<TicketEventDto>> ticketsFuture = supplyCatalogAsync(() -> listRecentTickets(ticketsLimit));

        CompletableFuture.allOf(
                categoriesFuture,
                featuredCategoriesFuture,
                featuredProductsFuture,
                bestSellerProductsFuture,
                latestProductsFuture,
                productsPageFuture,
                partnersPageFuture,
                postsFuture,
                ticketsFuture
        ).join();

        List<CatalogCategoryDto> categories = categoriesFuture.join();
        List<CatalogCategoryDto> featuredCategories = featuredCategoriesFuture.join();
        List<CatalogProductDto> featuredProducts = featuredProductsFuture.join();
        List<CatalogProductDto> bestSellerProducts = bestSellerProductsFuture.join();
        List<CatalogProductDto> latestProducts = latestProductsFuture.join();
        Page<CatalogProductDto> productsPage = productsPageFuture.join();
        Page<PartnerCatalogPartnerDto> partnersPageResult = partnersPageFuture.join();
        List<BlogPostDto> posts = postsFuture.join();
        List<TicketEventDto> tickets = ticketsFuture.join();

        CatalogProductsPageDto products = new CatalogProductsPageDto(
                productsPage.getContent(),
                productsPage.getNumber(),
                productsPage.getSize(),
                productsPage.getTotalElements(),
                productsPage.getTotalPages()
        );
        CatalogPartnersPageDto partners = new CatalogPartnersPageDto(
                partnersPageResult.getContent(),
                partnersPageResult.getNumber(),
                partnersPageResult.getSize(),
                partnersPageResult.getTotalElements(),
                partnersPageResult.getTotalPages()
        );

        CatalogProductDto heroProduct = featuredProducts.stream()
                .filter(this::hasMainImage)
                .findFirst()
                .orElseGet(() -> featuredProducts.isEmpty() ? null : featuredProducts.get(0));

        return new CatalogCollectionDto(
                categories,
                featuredCategories,
                heroProduct,
                featuredProducts,
                bestSellerProducts,
                latestProducts,
                products,
                partners,
                posts,
                tickets
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogProductPageCollectionDto getProductPageCollection(Long id, int page, int size, Integer relatedLimit, String sortKey) {
        CatalogProductDetailsDto product = getProductDetails(id);
        int safeRelatedLimit = safeRelatedLimit(relatedLimit);
        String safeSortKey = normalizeSortKeyOrDefault(sortKey, "newest");
        int safePage = safePage(page);
        int safeSize = safeSize(size);

        List<CatalogProductDto> related = buildRelatedProducts(product.id(), product.categorySlug(), safePage, safeSize, safeRelatedLimit, safeSortKey);
        return new CatalogProductPageCollectionDto(product, related);
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogProductPageCollectionDto getProductPageCollection(String idOrReference, int page, int size, Integer relatedLimit, String sortKey) {
        CatalogProductDetailsDto product = getProductDetails(idOrReference);
        int safeRelatedLimit = safeRelatedLimit(relatedLimit);
        String safeSortKey = normalizeSortKeyOrDefault(sortKey, "newest");
        int safePage = safePage(page);
        int safeSize = safeSize(size);

        List<CatalogProductDto> related = buildRelatedProducts(product.id(), product.categorySlug(), safePage, safeSize, safeRelatedLimit, safeSortKey);
        return new CatalogProductPageCollectionDto(product, related);
    }

    private Article getActiveArticleOrThrow(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(id)));
        if (article.getStatus() != ArticleStatus.ACTIVE) {
            throw new ResourceNotFoundException("Article", "id", String.valueOf(id));
        }
        return article;
    }

    private Article resolveActiveArticleOrThrow(String idOrReference) {
        String normalized = normalizeBlank(idOrReference);
        if (normalized == null) {
            throw new ResourceNotFoundException("Article", "id", String.valueOf(idOrReference));
        }

        Long id = tryParseLong(normalized);
        if (id != null) {
            return getActiveArticleOrThrow(id);
        }

        Article article = findActiveByReference(normalized)
                .or(() -> {
                    String cleaned = trimTrailingPunctuation(normalized);
                    if (Objects.equals(cleaned, normalized)) {
                        return Optional.empty();
                    }
                    return findActiveByReference(cleaned);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", normalized));
        return article;
    }

    private Optional<Article> findActiveByReference(String reference) {
        return articleRepository.findBySku(reference)
                .filter(article -> article.getStatus() == ArticleStatus.ACTIVE)
                .or(() -> articleRepository.findByEan(reference)
                        .filter(article -> article.getStatus() == ArticleStatus.ACTIVE))
                .or(() -> articleRepository
                        .findByNameContainingIgnoreCaseAndStatus(reference, ArticleStatus.ACTIVE, PageRequest.of(0, 1))
                        .stream()
                        .findFirst());
    }

    private Long tryParseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String trimTrailingPunctuation(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("[\\p{Punct}\\s]+$", "");
    }

    private CatalogProductDto toCatalogProductDto(Article article) {
        return toCatalogProductList(List.of(article)).get(0);
    }

    private int computeStock(Long articleId) {
        Integer stock = stockRepository.sumAvailableByArticleId(articleId);
        return stock == null ? 0 : stock;
    }

    private Sort resolveSort(String sortKey) {
        String key = sortKey == null ? "" : sortKey.trim().toLowerCase(Locale.ROOT);
        if ("price-asc".equals(key)) {
            return Sort.by(Sort.Direction.ASC, "price");
        }
        if ("price-desc".equals(key)) {
            return Sort.by(Sort.Direction.DESC, "price");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    private List<CatalogProductDto> buildRelatedProducts(String productId, String categorySlug, int page, int size, int limit, String sortKey) {
        List<CatalogProductDto> candidates = new ArrayList<>();
        String categoryToken = normalize(categorySlug);
        CompletableFuture<List<CatalogProductDto>> fallbackFuture =
                supplyCatalogAsync(() -> listProducts(page, size, null, null, sortKey).getContent());
        CompletableFuture<List<CatalogProductDto>> categoryFuture = categoryToken == null
                ? CompletableFuture.completedFuture(List.of())
                : supplyCatalogAsync(() -> listProducts(page, size, null, categoryToken, sortKey).getContent());

        CompletableFuture.allOf(categoryFuture, fallbackFuture).join();

        appendRelatedCandidates(candidates, categoryFuture.join(), productId);
        if (candidates.size() < limit) {
            appendRelatedCandidates(candidates, fallbackFuture.join(), productId);
        }

        return deduplicateAndLimit(candidates, limit, productId);
    }

    private void appendRelatedCandidates(List<CatalogProductDto> target, List<CatalogProductDto> source, String productId) {
        if (source == null || source.isEmpty()) {
            return;
        }
        for (CatalogProductDto item : source) {
            if (item == null || item.id() == null || Objects.equals(item.id(), productId)) {
                continue;
            }
            target.add(item);
        }
    }

    private List<CatalogProductDto> deduplicateAndLimit(List<CatalogProductDto> source, int limit, String productId) {
        if (source == null || source.isEmpty()) {
            return List.of();
        }
        List<CatalogProductDto> result = new ArrayList<>(limit);
        Set<String> seen = new HashSet<>();
        for (CatalogProductDto item : source) {
            if (item == null || item.id() == null || Objects.equals(item.id(), productId) || seen.contains(item.id())) {
                continue;
            }
            seen.add(item.id());
            result.add(item);
            if (result.size() >= limit) {
                break;
            }
        }
        return result;
    }

    private SearchPayload buildSearchPayload(String q, String category) {
        String query = normalize(q);
        List<String> categoryTokens = normalizeCategoryTokens(category);
        boolean queryEmpty = query == null;
        String queryPattern = queryEmpty ? null : "%" + query.toLowerCase(Locale.ROOT) + "%";
        boolean tokensEmpty = categoryTokens == null || categoryTokens.isEmpty();
        List<String> safeTokens = tokensEmpty ? List.of("__never_match__") : categoryTokens;
        return new SearchPayload(queryPattern, queryEmpty, safeTokens, tokensEmpty);
    }

    private List<String> normalizeCategoryTokens(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        List<String> tokens = Arrays.stream(category.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .toList();
        return tokens.isEmpty() ? null : tokens;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int safePage(int page) {
        return Math.max(0, page);
    }

    private int safeSize(int size) {
        return Math.max(size, 1);
    }

    private int safeLimit(Integer limit, int fallback) {
        if (limit == null) {
            return fallback;
        }
        return Math.max(limit, 1);
    }

    private int safeRelatedLimit(Integer limit) {
        return safeLimit(limit, 8);
    }

    private String normalizeSortKeyOrDefault(String sortKey, String fallback) {
        String normalized = normalize(sortKey);
        return normalized == null ? fallback : normalized;
    }

    private boolean isActiveCategory(Category category) {
        return Boolean.TRUE.equals(category.getIsActivated());
    }

    private List<String> buildProductImages(Article article) {
        if (article == null) {
            return List.of();
        }
        List<String> images = new ArrayList<>();
        String mainImage = normalize(article.getMainImageUrl());
        if (mainImage != null) {
            images.add(mainImage);
        }
        if (article.getSecondaryImageUrls() != null) {
            article.getSecondaryImageUrls().stream()
                    .map(this::normalize)
                    .filter(Objects::nonNull)
                    .forEach(images::add);
        }
        return images;
    }

    private List<BlogPostDto> listRecentPosts(Integer limit) {
        int safeLimit = safeLimit(limit, 6);
        return blogPostRepository
                .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "publishedAt")))
                .getContent()
                .stream()
                .map(this::toBlogPostDto)
                .toList();
    }

    private List<TicketEventDto> listRecentTickets(Integer limit) {
        int safeLimit = safeLimit(limit, 6);
        return ticketEventRepository
                .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "eventDate")))
                .getContent()
                .stream()
                .map(this::toTicketEventDto)
                .toList();
    }

    private BlogPostDto toBlogPostDto(BlogPost entity) {
        return BlogPostDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .excerpt(entity.getExcerpt())
                .content(entity.getContent())
                .imageUrl(entity.getImageUrl())
                .featured(entity.getFeatured())
                .publishedAt(entity.getPublishedAt())
                .build();
    }

    private TicketEventDto toTicketEventDto(TicketEvent entity) {
        return TicketEventDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .location(entity.getLocation())
                .eventDate(entity.getEventDate())
                .imageUrl(entity.getImageUrl())
                .category(entity.getCategory())
                .price(entity.getPrice())
                .available(entity.getAvailable())
                .build();
    }

    private Set<Long> findLikedReviewIds(String userId, List<ProductReview> reviews) {
        if (userId == null || reviews.isEmpty()) {
            return Set.of();
        }
        List<Long> ids = reviews.stream().map(ProductReview::getId).toList();
        return productReviewLikeRepository.findByUserUserIdAndReviewIdIn(userId, ids)
                .stream()
                .map(like -> like.getReview().getId())
                .collect(Collectors.toSet());
    }

    private String requireCurrentUserId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private Article findArticleOrThrow(Long productId) {
        return articleRepository.findById(productId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
    }

    private UserEntity findUserOrThrow(String userId) {
        return userEntityRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED));
    }

    private ProductReview findReviewOrThrow(Long reviewId) {
        return productReviewRepository.findById(reviewId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
    }

    private Customer ensureCustomer(UserEntity user) {
        return customerRepository.findByUserId(user.getUserId())
                .orElseGet(() -> {
                    Customer toCreate = new Customer();
                    toCreate.setUser(user);
                    Customer saved = customerRepository.save(toCreate);
                    userService.upsertCustomerProfile(saved);
                    return saved;
                });
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }

    private double normalizeDouble(Double value) {
        return value == null ? 0D : value;
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private boolean hasMainImage(CatalogProductDto product) {
        if (product == null || product.mainImageUrl() == null) {
            return false;
        }
        return !product.mainImageUrl().trim().isEmpty();
    }

    private record SearchPayload(
            String queryPattern,
            boolean queryEmpty,
            List<String> categoryTokens,
            boolean tokensEmpty
    ) {}

    private <T> CompletableFuture<T> supplyCatalogAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    tx.setReadOnly(true);
                    return tx.execute(status -> supplier.get());
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, java.util.concurrent.TimeUnit.SECONDS);
    }

    private record ReviewStats(double avgRating, long reviews) {
        private static final ReviewStats EMPTY = new ReviewStats(0d, 0L);
    }

    private Page<CatalogProductDto> toCatalogProductPage(Page<Article> articlePage) {
        List<CatalogProductDto> content = toCatalogProductList(articlePage.getContent());
        return new PageImpl<>(content, articlePage.getPageable(), articlePage.getTotalElements());
    }

    private List<CatalogProductDto> toCatalogProductList(List<Article> articles) {
        if (articles == null || articles.isEmpty()) {
            return List.of();
        }
        List<Long> articleIds = articles.stream().map(Article::getId).toList();

        Map<Long, Integer> stockByArticleId;
        Map<Long, ReviewStats> reviewStatsByArticleId;
        if (isAggregatorThread()) {
            stockByArticleId = loadStockByArticleId(articleIds);
            reviewStatsByArticleId = loadReviewStatsByArticleId(articleIds);
        } else {
            CompletableFuture<Map<Long, Integer>> stockFuture = supplyCatalogAsync(() -> loadStockByArticleId(articleIds));
            CompletableFuture<Map<Long, ReviewStats>> reviewStatsFuture = supplyCatalogAsync(() -> loadReviewStatsByArticleId(articleIds));
            CompletableFuture.allOf(stockFuture, reviewStatsFuture).join();
            stockByArticleId = stockFuture.join();
            reviewStatsByArticleId = reviewStatsFuture.join();
        }

        return articles.stream()
                .map(article -> {
                    ReviewStats stats = reviewStatsByArticleId.getOrDefault(article.getId(), ReviewStats.EMPTY);
                    return catalogMapper.toCatalogProductDto(
                            article,
                            stockByArticleId.getOrDefault(article.getId(), 0),
                            stats.avgRating(),
                            stats.reviews()
                    );
                })
                .toList();
    }

    private Map<Long, Integer> loadStockByArticleId(List<Long> articleIds) {
        return stockRepository.sumAvailableByArticleIds(articleIds).stream()
                .collect(Collectors.toMap(
                        StockRepository.ArticleStockTotalView::getArticleId,
                        row -> row.getStock() == null ? 0 : row.getStock()
                ));
    }

    private Map<Long, ReviewStats> loadReviewStatsByArticleId(List<Long> articleIds) {
        return productReviewRepository
                .summarizePublicByArticleIds(articleIds)
                .stream()
                .collect(Collectors.toMap(
                        ProductReviewRepository.ArticleReviewStatsView::getArticleId,
                        row -> new ReviewStats(normalizeDouble(row.getAvgRating()), row.getReviews() == null ? 0L : row.getReviews()),
                        (left, right) -> left
                ));
    }

    private boolean isAggregatorThread() {
        return Thread.currentThread().getName().startsWith("aggregator-");
    }
}
