package com.lifeevent.lid.cache;

import com.lifeevent.lid.cache.event.BlogCatalogChangedEvent;
import com.lifeevent.lid.cache.event.CategoryCatalogChangedEvent;
import com.lifeevent.lid.cache.event.ProductCatalogChangedEvent;
import com.lifeevent.lid.cache.event.ReviewCatalogChangedEvent;
import com.lifeevent.lid.cache.event.TicketCatalogChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class CatalogCacheInvalidationListener {

    private final CatalogCacheInvalidator invalidator;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductChanged(ProductCatalogChangedEvent event) {
        invalidator.evictForProductChange(event.productIds());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCategoryChanged(CategoryCatalogChangedEvent event) {
        invalidator.evictForCategoryChange();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBlogChanged(BlogCatalogChangedEvent event) {
        invalidator.evictForBlogChange();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTicketChanged(TicketCatalogChangedEvent event) {
        invalidator.evictForTicketChange();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReviewChanged(ReviewCatalogChangedEvent event) {
        invalidator.evictForReviewChange(event.productIds());
    }
}
