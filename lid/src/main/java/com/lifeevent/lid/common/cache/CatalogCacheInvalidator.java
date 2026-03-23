package com.lifeevent.lid.common.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class CatalogCacheInvalidator {

    private final CacheScopeVersionService cacheScopeVersionService;

    public void evictForProductChange(Set<Long> productIds) {
        cacheScopeVersionService.bumpCatalog();
        cacheScopeVersionService.bumpProductGlobal();
        cacheScopeVersionService.bumpReview(productIds);
    }

    public void evictForCategoryChange() {
        cacheScopeVersionService.bumpCatalog();
        cacheScopeVersionService.bumpProductGlobal();
    }

    public void evictForBlogChange() {
        cacheScopeVersionService.bumpBlog();
        cacheScopeVersionService.bumpCatalog();
    }

    public void evictForTicketChange() {
        cacheScopeVersionService.bumpTicket();
        cacheScopeVersionService.bumpCatalog();
    }

    public void evictForReviewChange(Set<Long> productIds) {
        cacheScopeVersionService.bumpCatalog();
        cacheScopeVersionService.bumpReview(productIds);
    }

    public void evictForPartnerOrderChange(Set<String> partnerIds) {
        cacheScopeVersionService.bumpPartners(partnerIds);
    }
}
