package com.lifeevent.lid.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CatalogCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache(CatalogCacheNames.COLLECTION, 5, 1_000),
                buildCache(CatalogCacheNames.CATEGORIES, 24 * 60, 500),
                buildCache(CatalogCacheNames.FEATURED_CATEGORIES, 6 * 60, 500),
                buildCache(CatalogCacheNames.FEATURED_PRODUCTS, 20, 1_000),
                buildCache(CatalogCacheNames.BESTSELLER_PRODUCTS, 20, 1_000),
                buildCache(CatalogCacheNames.LATEST_PRODUCTS, 5, 1_000),
                buildCache(CatalogCacheNames.PRODUCT_DETAILS, 20, 10_000),
                buildCache(CatalogCacheNames.PRODUCT_REVIEWS, 10, 10_000),
                buildCache(CatalogCacheNames.BLOG_POSTS, 30, 1_000),
                buildCache(CatalogCacheNames.BLOG_POST_DETAILS, 30, 2_000),
                buildCache(CatalogCacheNames.TICKETS, 30, 1_000),
                buildCache(CatalogCacheNames.TICKET_DETAILS, 30, 2_000)
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
