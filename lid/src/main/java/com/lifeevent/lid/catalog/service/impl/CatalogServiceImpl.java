package com.lifeevent.lid.catalog.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.catalog.dto.*;
import com.lifeevent.lid.catalog.mapper.CatalogMapper;
import com.lifeevent.lid.catalog.service.CatalogService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.review.entity.ProductReview;
import com.lifeevent.lid.review.entity.ProductReviewLike;
import com.lifeevent.lid.review.entity.ProductReviewReport;
import com.lifeevent.lid.review.repository.ProductReviewLikeRepository;
import com.lifeevent.lid.review.repository.ProductReviewReportRepository;
import com.lifeevent.lid.review.repository.ProductReviewRepository;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@Transactional
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final ProductReviewRepository productReviewRepository;
    private final ProductReviewLikeRepository productReviewLikeRepository;
    private final ProductReviewReportRepository productReviewReportRepository;
    private final UserEntityRepository userEntityRepository;
    private final CustomerRepository customerRepository;
    private final CatalogMapper catalogMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleCatalogDto> getFeaturedArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<ArticleCatalogDto> list = articleRepository.findFeaturedArticles().stream()
                .skip((long) page * size)
                .limit(size)
                .map(catalogMapper::toArticleCatalogDto)
                .toList();
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleCatalogDto> getBestSellers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<ArticleCatalogDto> list = articleRepository.findBestSellers().stream()
                .skip((long) page * size)
                .limit(size)
                .map(catalogMapper::toArticleCatalogDto)
                .toList();
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleCatalogDto> getFlashSales(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<ArticleCatalogDto> list = articleRepository.findFlashSales(LocalDateTime.now()).stream()
                .skip((long) page * size)
                .limit(size)
                .map(catalogMapper::toArticleCatalogDto)
                .toList();
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleCatalogDto> getNewArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findNewArticles(pageable).map(catalogMapper::toArticleCatalogDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleCatalogDto> search(String name, Integer categoryId, Double minPrice, Double maxPrice,
                                          Boolean featured, Boolean flashSale, Boolean bestSeller, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByAdvancedSearchAndStatus(name, categoryId, minPrice, maxPrice, ArticleStatus.ACTIVE, pageable)
                .map(catalogMapper::toArticleCatalogDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CatalogProductDto> listProducts(int page, int size, String q, String category, String sortKey) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), resolveSort(sortKey));
        SearchPayload payload = buildSearchPayload(q, category);
        return articleRepository.searchCatalog(
                ArticleStatus.ACTIVE,
                payload.query(),
                payload.categoryTokens(),
                payload.tokensEmpty(),
                pageable
        ).map(this::toCatalogProductDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogProductDto> listFeaturedProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 12);
        return articleRepository.findFeaturedArticles().stream()
                .limit(safeLimit)
                .map(this::toCatalogProductDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogProductDto> listBestSellerProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 12);
        return articleRepository.findBestSellers().stream()
                .limit(safeLimit)
                .map(this::toCatalogProductDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogProductDto> listLatestProducts(Integer limit) {
        int safeLimit = safeLimit(limit, 20);
        return articleRepository.findNewArticles(PageRequest.of(0, safeLimit))
                .getContent()
                .stream()
                .map(this::toCatalogProductDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogProductDto getProduct(Long id) {
        Article article = getActiveArticleOrThrow(id);
        return toCatalogProductDto(article);
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogProductDetailsDto getProductDetails(Long id) {
        Article article = getActiveArticleOrThrow(id);
        String image = article.getImg();
        List<String> images = image == null || image.isBlank() ? List.of() : List.of(image);
        return catalogMapper.toCatalogProductDetailsDto(article, computeStock(article.getId()), images);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogCategoryDto> listCategories() {
        return categoryRepository.findAllByOrderByOrderIdxAsc().stream()
                .filter(this::isActiveCategory)
                .map(category -> catalogMapper.toCatalogCategoryDto(category, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
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
    public ProductReviewsResponse listProductReviews(Long productId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 50));

        Page<ProductReview> result = productReviewRepository.findPublicByArticleId(
                productId,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        String currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;
        Set<Long> likedByMe = findLikedReviewIds(currentUserId, result.getContent());

        double avgRating = normalizeDouble(productReviewRepository.avgPublicRatingByArticleId(productId));
        long reviewCount = productReviewRepository.countPublicByArticleId(productId);

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
    }

    private CatalogProductDto toCatalogProductDto(Article article) {
        return catalogMapper.toCatalogProductDto(
                article,
                computeStock(article.getId()),
                normalizeDouble(productReviewRepository.avgPublicRatingByArticleId(article.getId())),
                productReviewRepository.countPublicByArticleId(article.getId())
        );
    }

    private Article getActiveArticleOrThrow(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(id)));
        if (article.getStatus() != ArticleStatus.ACTIVE) {
            throw new ResourceNotFoundException("Article", "id", String.valueOf(id));
        }
        return article;
    }

    private int computeStock(Long articleId) {
        return stockRepository.findByArticleId(articleId).stream()
                .map(stock -> stock.getQuantityAvailable() == null ? 0 : stock.getQuantityAvailable())
                .reduce(0, Integer::sum);
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

    private SearchPayload buildSearchPayload(String q, String category) {
        String query = normalize(q);
        List<String> categoryTokens = normalizeCategoryTokens(category);
        boolean tokensEmpty = categoryTokens.isEmpty();
        if (tokensEmpty) {
            categoryTokens = List.of("");
        }
        return new SearchPayload(query, categoryTokens, tokensEmpty);
    }

    private List<String> normalizeCategoryTokens(String category) {
        if (category == null || category.isBlank()) {
            return List.of();
        }
        return Arrays.stream(category.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .toList();
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
        return Math.min(Math.max(size, 1), 200);
    }

    private int safeLimit(Integer limit, int fallback) {
        if (limit == null) {
            return fallback;
        }
        return Math.min(Math.max(limit, 1), 50);
    }

    private boolean isActiveCategory(Category category) {
        return Boolean.TRUE.equals(category.getIsActivated());
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
                .orElseGet(() -> customerRepository.save(Customer.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .emailVerified(user.isEmailVerified())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .blocked(Boolean.TRUE.equals(user.getBlocked()))
                        .build()));
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

    private record SearchPayload(String query, List<String> categoryTokens, boolean tokensEmpty) {}
}
