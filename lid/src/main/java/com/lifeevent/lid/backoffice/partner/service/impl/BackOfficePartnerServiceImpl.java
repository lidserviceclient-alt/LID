package com.lifeevent.lid.backoffice.partner.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.mapper.BackOfficeProductMapper;
import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.backoffice.partner.category.entity.PartnerSubCategory;
import com.lifeevent.lid.backoffice.partner.category.repository.PartnerSubCategoryRepository;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCategoriesCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerStatsDto;
import com.lifeevent.lid.backoffice.partner.mapper.BackOfficePartnerMapper;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderItemDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import com.lifeevent.lid.backoffice.partner.preference.entity.PartnerPreferences;
import com.lifeevent.lid.backoffice.partner.preference.repository.PartnerPreferencesRepository;
import com.lifeevent.lid.backoffice.partner.service.BackOfficePartnerService;
import com.lifeevent.lid.catalog.service.CatalogService;
import com.lifeevent.lid.common.cache.CacheScopeVersionService;
import com.lifeevent.lid.common.cache.event.ProductCatalogChangedEvent;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.entity.ShopStatusEnum;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import com.lifeevent.lid.user.partner.repository.ShopRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficePartnerServiceImpl implements BackOfficePartnerService {
    private static final int MAX_SECONDARY_IMAGES = 5;
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final PartnerRepository partnerRepository;
    private final ShopRepository shopRepository;
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final PartnerSubCategoryRepository partnerSubCategoryRepository;
    private final PartnerPreferencesRepository partnerPreferencesRepository;
    private final BackOfficePartnerMapper mapper;
    private final BackOfficeProductMapper backOfficeProductMapper;
    private final CatalogService catalogService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final CacheScopeVersionService cacheScopeVersionService;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_COLLECTION,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':p=' + #productLimit + ':o=' + #orderLimit + ':c=' + #customerLimit",
            sync = true
    )
    public BackOfficePartnerCollectionDto getMyCollection(int productLimit, int orderLimit, int customerLimit) {
        String partnerId = requireCurrentPartnerId();
        int safeProductLimit = safeLimit(productLimit, 8);
        int safeOrderLimit = safeLimit(orderLimit, 8);
        int safeCustomerLimit = safeLimit(customerLimit, 8);

        CompletableFuture<BackOfficePartnerStatsDto> statsFuture =
                supplyAggregationAsync(() -> buildStats(partnerId));
        CompletableFuture<List<BackOfficePartnerProductDto>> productsFuture =
                supplyAggregationAsync(() -> getProductsSlice(partnerId, safeProductLimit));
        CompletableFuture<List<BackOfficePartnerOrderDto>> ordersFuture =
                supplyAggregationAsync(() -> getOrdersSlice(partnerId, safeOrderLimit));
        CompletableFuture<List<BackOfficePartnerCustomerDto>> customersFuture =
                supplyAggregationAsync(() -> getCustomersSlice(partnerId, safeCustomerLimit));
        CompletableFuture<BackOfficePartnerSettingsDto> settingsFuture =
                supplyAggregationAsync(this::getMySettings);

        CompletableFuture.allOf(statsFuture, productsFuture, ordersFuture, customersFuture, settingsFuture).join();

        BackOfficePartnerStatsDto stats = statsFuture.join();
        List<BackOfficePartnerProductDto> products = productsFuture.join();
        List<BackOfficePartnerOrderDto> orders = ordersFuture.join();
        List<BackOfficePartnerCustomerDto> customers = customersFuture.join();
        BackOfficePartnerSettingsDto settings = settingsFuture.join();
        return new BackOfficePartnerCollectionDto(stats, products, orders, customers, settings);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_COLLECTION,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':stats'",
            sync = true
    )
    public BackOfficePartnerStatsDto getMyStats() {
        String partnerId = requireCurrentPartnerId();
        return buildStats(partnerId);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_PRODUCTS_PAGE,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':summary:p=' + #page + ':s=' + #size",
            sync = true
    )
    public PageResponse<BackOfficePartnerProductDto> getMyProducts(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Article> products = articleRepository.findByReferencePartner(partnerId, pageable);
        Map<Long, Integer> stockById = loadStockByArticleIds(products.getContent().stream().map(Article::getId).toList());
        return PageResponse.from(products.map(article -> mapper.toProductDto(article, stockById.getOrDefault(article.getId(), 0))));
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_ORDERS_PAGE,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':summary:p=' + #page + ':s=' + #size",
            sync = true
    )
    public PageResponse<BackOfficePartnerOrderDto> getMyOrders(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(orderRepository.findByPartnerId(partnerId, pageable).map(mapper::toOrderDto));
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_CUSTOMERS_PAGE,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':p=' + #page + ':s=' + #size",
            sync = true
    )
    public PageResponse<BackOfficePartnerCustomerDto> getMyCustomers(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size));
        Page<Customer> customerPage = orderRepository.findCustomersByPartnerId(partnerId, pageable);
        Map<String, OrderRepository.CustomerOrderMetricsView> metricsByCustomer = loadMetricsByCustomerIds(customerPage.getContent());
        return PageResponse.from(customerPage.map(customer -> mapper.toCustomerDto(customer, metricsByCustomer.get(customer.getUserId()))));
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_SETTINGS,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()",
            sync = true
    )
    public BackOfficePartnerSettingsDto getMySettings() {
        Partner partner = requirePartner(requireCurrentPartnerId());
        return mapper.toSettingsDto(partner);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_SETTINGS,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':collection'",
            sync = true
    )
    public BackOfficePartnerSettingsCollectionDto getMySettingsCollection() {
        CompletableFuture<BackOfficePartnerSettingsDto> settingsFuture = supplyAggregationAsync(this::getMySettings);
        CompletableFuture<PartnerPreferencesDto> preferencesFuture = supplyAggregationAsync(this::getMyPreferences);

        CompletableFuture.allOf(settingsFuture, preferencesFuture).join();
        return new BackOfficePartnerSettingsCollectionDto(
                settingsFuture.join(),
                preferencesFuture.join()
        );
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_CATEGORIES,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':collection'",
            sync = true
    )
    public BackOfficePartnerCategoriesCollectionDto getMyCategoriesCollection() {
        CompletableFuture<List<PartnerSubCategoryDto>> categoriesCrudFuture = supplyAggregationAsync(this::listMyCategories);
        CompletableFuture<List<com.lifeevent.lid.catalog.dto.CatalogCategoryDto>> categoriesFuture =
                supplyAggregationAsync(catalogService::listCategories);

        CompletableFuture.allOf(categoriesCrudFuture, categoriesFuture).join();
        return new BackOfficePartnerCategoriesCollectionDto(
                categoriesFuture.join(),
                categoriesCrudFuture.join()
        );
    }

    @Override
    @Transactional
    public BackOfficePartnerSettingsDto updateMySettings(BackOfficePartnerSettingsDto dto) {
        String partnerId = requireCurrentPartnerId();
        Partner partner = requirePartner(partnerId);

        partner.setFirstName(normalizeOrCurrent(dto.firstName(), partner.getFirstName()));
        partner.setLastName(normalizeOrCurrent(dto.lastName(), partner.getLastName()));
        partner.setPhoneNumber(normalizeOrCurrent(dto.phoneNumber(), partner.getPhoneNumber()));
        partner.setBankName(normalizeOrCurrent(dto.bankName(), partner.getBankName()));
        partner.setAccountHolder(normalizeOrCurrent(dto.accountHolder(), partner.getAccountHolder()));
        partner.setRib(normalizeOrCurrent(dto.rib(), partner.getRib()));
        partner.setIban(normalizeOrCurrent(dto.iban(), partner.getIban()));
        partner.setSwift(normalizeOrCurrent(dto.swift(), partner.getSwift()));
        partner.setHeadOfficeAddress(normalizeOrCurrent(dto.headOfficeAddress(), partner.getHeadOfficeAddress()));
        partner.setCity(normalizeOrCurrent(dto.city(), partner.getCity()));
        partner.setCountry(normalizeOrCurrent(dto.country(), partner.getCountry()));

        if (partner.getShop() == null) {
            partner.setShop(createShopFromSettings(dto));
        }

        Shop shop = partner.getShop();
        if (shop != null) {
            shop.setShopName(normalizeOrCurrent(dto.shopName(), shop.getShopName()));
            shop.setShopDescription(normalizeOrCurrent(dto.shopDescription(), shop.getShopDescription()));
            shop.setDescription(normalizeOrCurrent(dto.description(), shop.getDescription()));
            shop.setLogoUrl(normalizeOrCurrent(dto.logoUrl(), shop.getLogoUrl()));
            shop.setBackgroundUrl(normalizeOrCurrent(dto.backgroundUrl(), shop.getBackgroundUrl()));
            if (dto.mainCategoryId() != null) {
                shop.setMainCategory(requireCategory(dto.mainCategoryId()));
            }
        }

        Partner saved = partnerRepository.save(partner);
        userService.upsertPartnerProfile(saved);
        touchPartnerCaches(partnerId);
        return mapper.toSettingsDto(saved);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_PRODUCTS_PAGE,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':crud:p=' + #page + ':s=' + #size",
            sync = true
    )
    public PageResponse<BackOfficeProductDto> getMyProductsCrud(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Article> articles = articleRepository.findByReferencePartner(partnerId, pageable);
        Map<Long, Integer> stockById = loadStockByArticleIds(articles.getContent().stream().map(Article::getId).toList());
        return PageResponse.from(articles.map(article -> toCrudDto(article, stockById.getOrDefault(article.getId(), 0))));
    }

    @Override
    @Transactional
    public BackOfficeProductDto createMyProduct(BackOfficeProductDto dto) {
        String partnerId = requireCurrentPartnerId();
        normalizeImageFields(dto);
        Article entity = backOfficeProductMapper.toEntity(dto);
        enrichArticle(entity, dto);
        entity.setReferencePartner(partnerId);
        Article saved = articleRepository.save(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        publishCatalogChanged(saved.getId());
        touchPartnerCaches(partnerId);
        return toCrudDto(saved, loadSingleStock(saved.getId()));
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_PRODUCT_DETAILS,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':id=' + #id",
            sync = true
    )
    public BackOfficeProductDto getMyProduct(Long id) {
        Article article = findOwnedArticleOrThrow(id);
        return toCrudDto(article, loadSingleStock(article.getId()));
    }

    @Override
    @Transactional
    public BackOfficeProductDto updateMyProduct(Long id, BackOfficeProductDto dto) {
        normalizeImageFields(dto);
        Article entity = findOwnedArticleOrThrow(id);
        backOfficeProductMapper.updateEntityFromDto(dto, entity);
        enrichArticle(entity, dto);
        Article saved = articleRepository.save(entity);
        upsertStock(saved, dto != null ? dto.getStock() : null);
        publishCatalogChanged(saved.getId());
        touchPartnerCaches(requireCurrentPartnerId());
        return toCrudDto(saved, loadSingleStock(saved.getId()));
    }

    @Override
    @Transactional
    public void deleteMyProduct(Long id) {
        Article entity = findOwnedArticleOrThrow(id);
        entity.setStatus(ArticleStatus.ARCHIVED);
        Article saved = articleRepository.save(entity);
        publishCatalogChanged(saved.getId());
        touchPartnerCaches(requireCurrentPartnerId());
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_ORDERS_PAGE,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':crud:p=' + #page + ':s=' + #size",
            sync = true
    )
    public PageResponse<BackOfficePartnerOrderDto> listMyOrdersCrud(int page, int size) {
        return getMyOrders(page, size);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_ORDER_DETAILS,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId() + ':id=' + #id",
            sync = true
    )
    public PartnerOrderDetailDto getMyOrder(Long id) {
        String partnerId = requireCurrentPartnerId();
        Order order = orderRepository.findPartnerOwnedWithCustomerAndArticlesById(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id == null ? "" : String.valueOf(id)));
        return toOrderDetailDto(order, partnerId);
    }

    @Override
    @Transactional
    public PartnerOrderDetailDto updateMyOrder(Long id, PartnerOrderUpdateRequest request) {
        String partnerId = requireCurrentPartnerId();
        Order order = orderRepository.findPartnerOwnedWithCustomerAndStatusHistoryById(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id == null ? "" : String.valueOf(id)));

        if (request != null) {
            Status next = parseStatus(request.getStatus());
            if (next != null) {
                order.setCurrentStatus(next);
                appendStatusHistory(order, next, request.getComment());
            }
            if (request.getTrackingNumber() != null && !request.getTrackingNumber().trim().isEmpty()) {
                order.setTrackingNumber(request.getTrackingNumber().trim());
            }
        }

        Order saved = orderRepository.save(order);
        Order withArticles = orderRepository.findPartnerOwnedWithCustomerAndArticlesById(saved.getId(), partnerId)
                .orElse(saved);
        touchPartnerCaches(partnerId);
        return toOrderDetailDto(withArticles, partnerId);
    }

    @Override
    @Transactional
    public void cancelMyOrder(Long id, String comment) {
        updateMyOrder(id, PartnerOrderUpdateRequest.builder().status(Status.CANCELED.name()).comment(comment).build());
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_CATEGORIES,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()",
            sync = true
    )
    public List<PartnerSubCategoryDto> listMyCategories() {
        String partnerId = requireCurrentPartnerId();
        return partnerSubCategoryRepository.findByPartnerIdOrderByCreatedAtDesc(partnerId).stream()
                .map(this::toPartnerSubCategoryDto)
                .toList();
    }

    @Override
    @Transactional
    public PartnerSubCategoryDto createMyCategory(PartnerSubCategoryDto dto) {
        String partnerId = requireCurrentPartnerId();
        PartnerSubCategory entity = PartnerSubCategory.builder()
                .partnerId(partnerId)
                .mainCategoryId(dto != null ? dto.getMainCategoryId() : null)
                .name(dto != null ? dto.getName() : null)
                .description(dto != null ? dto.getDescription() : null)
                .build();
        PartnerSubCategoryDto created = toPartnerSubCategoryDto(partnerSubCategoryRepository.save(entity));
        touchPartnerCaches(partnerId);
        return created;
    }

    @Override
    public PartnerSubCategoryDto getMyCategory(Long id) {
        return toPartnerSubCategoryDto(findOwnedSubCategoryOrThrow(id));
    }

    @Override
    @Transactional
    public PartnerSubCategoryDto updateMyCategory(Long id, PartnerSubCategoryDto dto) {
        String partnerId = requireCurrentPartnerId();
        PartnerSubCategory entity = findOwnedSubCategoryOrThrow(id);
        if (dto != null) {
            if (dto.getMainCategoryId() != null) {
                entity.setMainCategoryId(dto.getMainCategoryId());
            }
            if (dto.getName() != null) {
                entity.setName(dto.getName());
            }
            entity.setDescription(dto.getDescription());
        }
        PartnerSubCategoryDto updated = toPartnerSubCategoryDto(partnerSubCategoryRepository.save(entity));
        touchPartnerCaches(partnerId);
        return updated;
    }

    @Override
    @Transactional
    public void deleteMyCategory(Long id) {
        String partnerId = requireCurrentPartnerId();
        partnerSubCategoryRepository.delete(findOwnedSubCategoryOrThrow(id));
        touchPartnerCaches(partnerId);
    }

    @Override
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_PREFERENCES,
            key = "@cacheScopeVersionService.partnerVersionToken(T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()) + ':' + T(com.lifeevent.lid.common.security.SecurityUtils).getCurrentUserId()",
            sync = true
    )
    public PartnerPreferencesDto getMyPreferences() {
        String partnerId = requireCurrentPartnerId();
        return partnerPreferencesRepository.findById(partnerId)
                .map(this::toPartnerPreferencesDto)
                .orElseGet(() -> {
                    PartnerPreferences created = partnerPreferencesRepository.save(PartnerPreferences.builder().partnerId(partnerId).build());
                    return toPartnerPreferencesDto(created);
                });
    }

    @Override
    @Transactional
    public PartnerPreferencesDto updateMyPreferences(PartnerPreferencesDto dto) {
        String partnerId = requireCurrentPartnerId();
        PartnerPreferences entity = partnerPreferencesRepository.findById(partnerId)
                .orElseGet(() -> PartnerPreferences.builder().partnerId(partnerId).build());

        if (dto != null) {
            entity.setStockThreshold(dto.stockThreshold());
            entity.setWebsiteUrl(normalizeOrNull(dto.websiteUrl()));
            entity.setInstagramHandle(normalizeOrNull(dto.instagramHandle()));
            entity.setFacebookPage(normalizeOrNull(dto.facebookPage()));
            entity.setOpeningHoursJson(normalizeOrNull(dto.openingHoursJson()));
        }
        PartnerPreferencesDto updated = toPartnerPreferencesDto(partnerPreferencesRepository.save(entity));
        touchPartnerCaches(partnerId);
        return updated;
    }

    private BackOfficePartnerStatsDto buildStats(String partnerId) {
        long products = articleRepository.countByReferencePartner(partnerId);
        OrderRepository.PartnerOrderMetricsView orderMetrics = orderRepository.aggregateMetricsByPartnerId(partnerId);
        long orders = orderMetrics == null || orderMetrics.getOrders() == null ? 0L : orderMetrics.getOrders();
        double revenue = orderMetrics == null || orderMetrics.getRevenue() == null ? 0D : orderMetrics.getRevenue();
        long customers = orderRepository.countDistinctCustomersByPartnerId(partnerId);
        return new BackOfficePartnerStatsDto(products, orders, customers, revenue);
    }

    private <T> CompletableFuture<T> supplyAggregationAsync(Supplier<T> supplier) {
        SecurityContext capturedContext = SecurityContextHolder.getContext();
        return CompletableFuture.supplyAsync(() -> {
                    SecurityContext previous = SecurityContextHolder.getContext();
                    try {
                        SecurityContextHolder.setContext(capturedContext);
                        TransactionTemplate tx = new TransactionTemplate(transactionManager);
                        tx.setReadOnly(true);
                        return tx.execute(status -> supplier.get());
                    } finally {
                        SecurityContextHolder.clearContext();
                        if (previous != null) {
                            SecurityContextHolder.setContext(previous);
                        }
                    }
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    throw new RuntimeException(ex);
                });
    }

    private List<BackOfficePartnerProductDto> getProductsSlice(String partnerId, int limit) {
        Page<Article> page = articleRepository.findByReferencePartner(partnerId, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<Long, Integer> stockById = loadStockByArticleIds(page.getContent().stream().map(Article::getId).toList());
        return page.getContent().stream()
                .map(article -> mapper.toProductDto(article, stockById.getOrDefault(article.getId(), 0)))
                .toList();
    }

    private List<BackOfficePartnerOrderDto> getOrdersSlice(String partnerId, int limit) {
        return orderRepository.findByPartnerId(partnerId, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent()
                .stream()
                .map(mapper::toOrderDto)
                .toList();
    }

    private List<BackOfficePartnerCustomerDto> getCustomersSlice(String partnerId, int limit) {
        Page<Customer> page = orderRepository.findCustomersByPartnerId(partnerId, PageRequest.of(0, limit));
        Map<String, OrderRepository.CustomerOrderMetricsView> metricsByCustomer = loadMetricsByCustomerIds(page.getContent());
        return page.getContent().stream()
                .map(customer -> mapper.toCustomerDto(customer, metricsByCustomer.get(customer.getUserId())))
                .toList();
    }

    private Map<Long, Integer> loadStockByArticleIds(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return Map.of();
        }
        return stockRepository.sumAvailableByArticleIds(articleIds).stream()
                .collect(Collectors.toMap(
                        StockRepository.ArticleStockTotalView::getArticleId,
                        row -> row.getStock() == null ? 0 : row.getStock(),
                        (left, right) -> left
                ));
    }

    private int loadSingleStock(Long articleId) {
        if (articleId == null) {
            return 0;
        }
        Integer stock = stockRepository.sumAvailableByArticleId(articleId);
        return stock == null ? 0 : stock;
    }

    private Map<String, OrderRepository.CustomerOrderMetricsView> loadMetricsByCustomerIds(Collection<Customer> customers) {
        if (customers == null || customers.isEmpty()) {
            return Map.of();
        }
        List<String> ids = customers.stream().map(Customer::getUserId).distinct().toList();
        return orderRepository.aggregateMetricsByCustomerIds(ids).stream()
                .collect(Collectors.toMap(OrderRepository.CustomerOrderMetricsView::getCustomerId, Function.identity()));
    }

    private Partner requirePartner(String partnerId) {
        Partner partner = partnerRepository.findByUserIdWithShop(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
        if (partner.getRegistrationStatus() != PartnerRegistrationStatus.VERIFIED) {
            throw new ResponseStatusException(FORBIDDEN, "Compte partenaire en attente de validation");
        }
        return partner;
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private int safePage(int page) {
        return Math.max(0, page);
    }

    private int safePageSize(int size) {
        return Math.max(size, 1);
    }

    private int safeLimit(int limit, int fallback) {
        if (limit <= 0) {
            return Math.max(1, fallback);
        }
        return limit;
    }

    private void touchPartnerCaches(String partnerId) {
        cacheScopeVersionService.bumpPartner(partnerId);
    }

    private String normalizeOrCurrent(String value, String current) {
        if (value == null) {
            return current;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? current : trimmed;
    }

    private String normalizeOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Shop createShopFromSettings(BackOfficePartnerSettingsDto dto) {
        if (dto == null || dto.mainCategoryId() == null) {
            throw new IllegalArgumentException("mainCategoryId est requis pour créer la boutique.");
        }
        Category category = requireCategory(dto.mainCategoryId());
        Shop shop = Shop.builder()
                .shopName(requireNonBlank(dto.shopName(), "shopName est requis pour créer la boutique."))
                .shopDescription(normalizeOrNull(dto.shopDescription()))
                .description(requireNonBlank(dto.description(), "description est requise pour créer la boutique."))
                .logoUrl(requireNonBlank(dto.logoUrl(), "logoUrl est requis pour créer la boutique."))
                .backgroundUrl(requireNonBlank(dto.backgroundUrl(), "backgroundUrl est requis pour créer la boutique."))
                .status(ShopStatusEnum.PRINCIPALE)
                .mainCategory(category)
                .build();
        return shopRepository.save(shop);
    }

    private Category requireCategory(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", String.valueOf(categoryId)));
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private BackOfficeProductDto toCrudDto(Article article, Integer stock) {
        BackOfficeProductDto dto = backOfficeProductMapper.toDto(article);
        String mainImageUrl = article.getMainImageUrl();
        dto.setMainImageUrl(mainImageUrl);
        dto.setSecondaryImageUrls(article.getSecondaryImageUrls() == null
                ? List.of()
                : article.getSecondaryImageUrls().stream()
                .map(value -> value == null ? null : value.trim())
                .filter(value -> value != null && !value.isBlank())
                .toList());
        dto.setStatus(toBackOfficeStatus(article.getStatus()));
        if (article.getCategories() != null && !article.getCategories().isEmpty()) {
            Category category = article.getCategories().get(0);
            if (category != null) {
                dto.setCategoryId(category.getId() == null ? null : String.valueOf(category.getId()));
                dto.setCategoryBusinessId(category.getBusinessId());
                dto.setCategory(category.getName());
            }
        }
        dto.setStock(stock == null ? 0 : stock);
        return dto;
    }

    private void normalizeImageFields(BackOfficeProductDto dto) {
        if (dto == null) {
            return;
        }
        dto.setMainImageUrl(dto.getMainImageUrl() == null ? null : dto.getMainImageUrl().trim());
        if (dto.getMainImageUrl() != null && dto.getMainImageUrl().isBlank()) {
            dto.setMainImageUrl(null);
        }
        if (dto.getSecondaryImageUrls() != null) {
            List<String> secondaryImages = dto.getSecondaryImageUrls().stream()
                    .map(value -> value == null ? null : value.trim())
                    .filter(value -> value != null && !value.isBlank())
                    .toList();
            if (secondaryImages.size() > MAX_SECONDARY_IMAGES) {
                throw new IllegalArgumentException("secondaryImageUrls: maximum " + MAX_SECONDARY_IMAGES + " images.");
            }
            dto.setSecondaryImageUrls(secondaryImages);
            if (!secondaryImages.isEmpty() && dto.getMainImageUrl() == null) {
                throw new IllegalArgumentException("mainImageUrl is required when secondaryImageUrls is provided.");
            }
        }
    }

    private void enrichArticle(Article entity, BackOfficeProductDto dto) {
        applyStatus(entity, dto != null ? dto.getStatus() : null);
        applyDefaults(entity, dto);
        applyCategory(entity, dto);
    }

    private void applyDefaults(Article entity, BackOfficeProductDto dto) {
        if (entity == null) {
            return;
        }
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
        ArticleStatus parsed = parseArticleStatus(rawStatus);
        if (parsed != null) {
            entity.setStatus(parsed);
        }
    }

    private ArticleStatus parseArticleStatus(String rawStatus) {
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
        if (status == null) {
            return "ACTIF";
        }
        return switch (status) {
            case ACTIVE -> "ACTIF";
            case DRAFT -> "BROUILLON";
            case ARCHIVED -> "ARCHIVE";
        };
    }

    private void applyCategory(Article entity, BackOfficeProductDto dto) {
        Category category = resolveCategory(dto);
        if (category == null) {
            return;
        }
        entity.setCategories(List.of(category));
    }

    private Category resolveCategory(BackOfficeProductDto dto) {
        if (dto == null) return null;
        List<String> candidates = new ArrayList<>();
        String categoryId = normalizeOrNull(dto.getCategoryId());
        String categoryBusinessId = normalizeOrNull(dto.getCategoryBusinessId());
        String category = normalizeOrNull(dto.getCategory());
        if (categoryId != null) candidates.add(categoryId);
        if (categoryBusinessId != null) candidates.add(categoryBusinessId);
        if (category != null) candidates.add(category);

        for (String candidate : candidates) {
            Category resolved = findCategoryByCandidate(candidate);
            if (resolved != null) return resolved;
        }
        return null;
    }

    private Category findCategoryByCandidate(String raw) {
        if (raw == null) return null;
        Integer id = tryParseInt(raw);
        if (id != null) {
            Optional<Category> byId = categoryRepository.findById(id);
            if (byId.isPresent()) return byId.get();
        }
        Optional<Category> byBusinessId = categoryRepository.findByBusinessIdIgnoreCase(raw);
        if (byBusinessId.isPresent()) return byBusinessId.get();
        Optional<Category> bySlug = categoryRepository.findBySlugIgnoreCase(raw);
        if (bySlug.isPresent()) return bySlug.get();
        return categoryRepository.findByNameIgnoreCase(raw).orElse(null);
    }

    private Integer tryParseInt(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Article findOwnedArticleOrThrow(Long id) {
        String partnerId = requireCurrentPartnerId();
        return articleRepository.findByIdAndReferencePartner(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", id == null ? "" : String.valueOf(id)));
    }

    private void upsertStock(Article article, Integer stockValue) {
        if (article == null || article.getId() == null || stockValue == null) {
            return;
        }
        List<Stock> stocks = stockRepository.findByArticleId(article.getId());
        if (stocks == null || stocks.isEmpty()) {
            stockRepository.save(Stock.builder()
                    .article(article)
                    .quantityAvailable(Math.max(0, stockValue))
                    .quantityReserved(0)
                    .lot(article.getSku())
                    .build());
            return;
        }
        Stock stock = stocks.get(0);
        stock.setQuantityAvailable(Math.max(0, stockValue));
        if (stock.getQuantityReserved() == null) {
            stock.setQuantityReserved(0);
        }
        if (stock.getLot() == null || stock.getLot().isBlank()) {
            stock.setLot(article.getSku());
        }
        stockRepository.save(stock);
    }

    private void publishCatalogChanged(Long articleId) {
        eventPublisher.publishEvent(new ProductCatalogChangedEvent(articleId == null ? Set.of() : Set.of(articleId)));
    }

    private PartnerOrderDetailDto toOrderDetailDto(Order order, String partnerId) {
        Customer customer = order.getCustomer();
        String fullName = customer == null ? null : formatFullName(customer.getFirstName(), customer.getLastName());
        List<PartnerOrderItemDto> items = buildPartnerOrderItems(order, partnerId);
        double amount = items.stream()
                .filter(Objects::nonNull)
                .mapToDouble(item -> (item.getPrice() == null ? 0D : item.getPrice()) * (item.getQuantity() == null ? 0 : item.getQuantity()))
                .sum();

        return PartnerOrderDetailDto.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .status(order.getCurrentStatus())
                .amount(amount)
                .currency(order.getCurrency())
                .customerId(customer == null ? null : customer.getUserId())
                .customerName(fullName)
                .customerEmail(customer == null ? null : customer.getEmail())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private List<PartnerOrderItemDto> buildPartnerOrderItems(Order order, String partnerId) {
        if (order == null || order.getArticles() == null) {
            return List.of();
        }
        return order.getArticles().stream()
                .filter(Objects::nonNull)
                .filter(oa -> isOwnedByPartner(oa, partnerId))
                .map(this::toPartnerOrderItemDto)
                .toList();
    }

    private boolean isOwnedByPartner(OrderArticle orderArticle, String partnerId) {
        if (orderArticle == null || partnerId == null) {
            return false;
        }
        Article article = orderArticle.getArticle();
        return article != null && partnerId.equals(article.getReferencePartner());
    }

    private PartnerOrderItemDto toPartnerOrderItemDto(OrderArticle orderArticle) {
        Article article = orderArticle.getArticle();
        return PartnerOrderItemDto.builder()
                .articleId(article == null ? null : article.getId())
                .name(article == null ? null : article.getName())
                .quantity(orderArticle.getQuantity())
                .price(orderArticle.getPriceAtOrder())
                .imageUrl(article == null ? null : article.getImg())
                .build();
    }

    private void appendStatusHistory(Order order, Status status, String comment) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }
        order.getStatusHistory().add(StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(normalizeOrNull(comment))
                .changedAt(LocalDateTime.now())
                .build());
    }

    private Status parseStatus(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return null;
        }
        try {
            return Status.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String formatFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isEmpty() ? null : full;
    }

    private PartnerSubCategory findOwnedSubCategoryOrThrow(Long id) {
        String partnerId = requireCurrentPartnerId();
        return partnerSubCategoryRepository.findByIdAndPartnerId(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("PartnerSubCategory", "id", id == null ? "" : String.valueOf(id)));
    }

    private PartnerSubCategoryDto toPartnerSubCategoryDto(PartnerSubCategory entity) {
        if (entity == null) {
            return null;
        }
        return PartnerSubCategoryDto.builder()
                .id(entity.getId())
                .mainCategoryId(entity.getMainCategoryId())
                .name(entity.getName())
                .description(entity.getDescription())
                .productCount(0)
                .build();
    }

    private PartnerPreferencesDto toPartnerPreferencesDto(PartnerPreferences entity) {
        return new PartnerPreferencesDto(
                entity.getStockThreshold(),
                entity.getWebsiteUrl(),
                entity.getInstagramHandle(),
                entity.getFacebookPage(),
                entity.getOpeningHoursJson()
        );
    }
}
