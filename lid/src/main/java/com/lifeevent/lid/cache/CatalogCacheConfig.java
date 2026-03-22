package com.lifeevent.lid.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
@EnableConfigurationProperties(CatalogCacheProperties.class)
public class CatalogCacheConfig {

    private final CatalogCacheProperties properties;

    public CatalogCacheConfig(CatalogCacheProperties properties) {
        this.properties = properties;
    }

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache(CatalogCacheNames.COLLECTION, properties.getCollectionTtlMinutes(), properties.getCollectionMaxSize()),
                buildCache(CatalogCacheNames.CATEGORIES, properties.getCategoriesTtlMinutes(), properties.getCategoriesMaxSize()),
                buildCache(CatalogCacheNames.FEATURED_CATEGORIES, properties.getFeaturedCategoriesTtlMinutes(), properties.getFeaturedCategoriesMaxSize()),
                buildCache(CatalogCacheNames.FEATURED_PRODUCTS, properties.getFeaturedProductsTtlMinutes(), properties.getFeaturedProductsMaxSize()),
                buildCache(CatalogCacheNames.BESTSELLER_PRODUCTS, properties.getBestsellerProductsTtlMinutes(), properties.getBestsellerProductsMaxSize()),
                buildCache(CatalogCacheNames.LATEST_PRODUCTS, properties.getLatestProductsTtlMinutes(), properties.getLatestProductsMaxSize()),
                buildCache(CatalogCacheNames.PRODUCT_DETAILS, properties.getProductDetailsTtlMinutes(), properties.getProductDetailsMaxSize()),
                buildCache(CatalogCacheNames.PRODUCT_REVIEWS, properties.getProductReviewsTtlMinutes(), properties.getProductReviewsMaxSize()),
                buildCache(CatalogCacheNames.BLOG_POSTS, properties.getBlogPostsTtlMinutes(), properties.getBlogPostsMaxSize()),
                buildCache(CatalogCacheNames.BLOG_POST_DETAILS, properties.getBlogPostDetailsTtlMinutes(), properties.getBlogPostDetailsMaxSize()),
                buildCache(CatalogCacheNames.TICKETS, properties.getTicketsTtlMinutes(), properties.getTicketsMaxSize()),
                buildCache(CatalogCacheNames.TICKET_DETAILS, properties.getTicketDetailsTtlMinutes(), properties.getTicketDetailsMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_COLLECTION, properties.getPartnerCollectionTtlMinutes(), properties.getPartnerCollectionMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_SETTINGS, properties.getPartnerSettingsTtlMinutes(), properties.getPartnerSettingsMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_PRODUCTS_PAGE, properties.getPartnerProductsPageTtlMinutes(), properties.getPartnerProductsPageMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_PRODUCT_DETAILS, properties.getPartnerProductDetailsTtlMinutes(), properties.getPartnerProductDetailsMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_ORDERS_PAGE, properties.getPartnerOrdersPageTtlMinutes(), properties.getPartnerOrdersPageMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_ORDER_DETAILS, properties.getPartnerOrderDetailsTtlMinutes(), properties.getPartnerOrderDetailsMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_CUSTOMERS_PAGE, properties.getPartnerCustomersPageTtlMinutes(), properties.getPartnerCustomersPageMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_CATEGORIES, properties.getPartnerCategoriesTtlMinutes(), properties.getPartnerCategoriesMaxSize()),
                buildCache(CatalogCacheNames.PARTNER_PREFERENCES, properties.getPartnerPreferencesTtlMinutes(), properties.getPartnerPreferencesMaxSize())
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, long ttlMinutes, long maxSize) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
                .maximumSize(maxSize)
                .build());
    }
}
