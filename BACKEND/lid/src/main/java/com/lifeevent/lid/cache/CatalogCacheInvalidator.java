package com.lifeevent.lid.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class CatalogCacheInvalidator {

    private final CacheManager cacheManager;

    public void evictForProductChange(Set<Long> productIds) {
        evictCoreCatalogLists();
        evictProductDetails(productIds);
        evictAll(CatalogCacheNames.PRODUCT_REVIEWS);
    }

    public void evictForCategoryChange() {
        evictCoreCatalogLists();
        evictAll(CatalogCacheNames.CATEGORIES);
        evictAll(CatalogCacheNames.FEATURED_CATEGORIES);
        evictAll(CatalogCacheNames.PRODUCT_DETAILS);
        evictAll(CatalogCacheNames.PRODUCT_REVIEWS);
    }

    public void evictForBlogChange() {
        evictAll(CatalogCacheNames.BLOG_POSTS);
        evictAll(CatalogCacheNames.BLOG_POST_DETAILS);
        evictAll(CatalogCacheNames.COLLECTION);
    }

    public void evictForTicketChange() {
        evictAll(CatalogCacheNames.TICKETS);
        evictAll(CatalogCacheNames.TICKET_DETAILS);
        evictAll(CatalogCacheNames.COLLECTION);
    }

    public void evictForReviewChange(Set<Long> productIds) {
        evictCoreCatalogLists();
        evictProductDetails(productIds);
        evictAll(CatalogCacheNames.PRODUCT_REVIEWS);
    }

    private void evictCoreCatalogLists() {
        evictAll(CatalogCacheNames.COLLECTION);
        evictAll(CatalogCacheNames.FEATURED_PRODUCTS);
        evictAll(CatalogCacheNames.BESTSELLER_PRODUCTS);
        evictAll(CatalogCacheNames.LATEST_PRODUCTS);
    }

    private void evictProductDetails(Set<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            evictAll(CatalogCacheNames.PRODUCT_DETAILS);
            return;
        }
        for (Long id : productIds) {
            if (id == null) {
                continue;
            }
            evictKey(CatalogCacheNames.PRODUCT_DETAILS, id);
        }
    }

    private void evictAll(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }

    private void evictKey(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
        }
    }
}
