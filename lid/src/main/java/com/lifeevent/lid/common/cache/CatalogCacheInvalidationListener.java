package com.lifeevent.lid.common.cache;

import com.lifeevent.lid.common.cache.event.BlogCatalogChangedEvent;
import com.lifeevent.lid.common.cache.event.CategoryCatalogChangedEvent;
import com.lifeevent.lid.common.cache.event.PartnerOrderChangedEvent;
import com.lifeevent.lid.common.cache.event.ProductCatalogChangedEvent;
import com.lifeevent.lid.common.cache.event.ReviewCatalogChangedEvent;
import com.lifeevent.lid.common.cache.event.TicketCatalogChangedEvent;
import com.lifeevent.lid.realtime.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class CatalogCacheInvalidationListener {

    private final CatalogCacheInvalidator invalidator;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onProductChanged(ProductCatalogChangedEvent event) {
        invalidator.evictForProductChange(event.productIds());
        realtimeEventPublisher.publishCatalogUpdated("product_change");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCategoryChanged(CategoryCatalogChangedEvent event) {
        invalidator.evictForCategoryChange();
        realtimeEventPublisher.publishCatalogUpdated("category_change");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onBlogChanged(BlogCatalogChangedEvent event) {
        invalidator.evictForBlogChange();
        realtimeEventPublisher.publishCatalogUpdated("blog_change");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTicketChanged(TicketCatalogChangedEvent event) {
        invalidator.evictForTicketChange();
        realtimeEventPublisher.publishCatalogUpdated("ticket_change");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onReviewChanged(ReviewCatalogChangedEvent event) {
        invalidator.evictForReviewChange(event.productIds());
        realtimeEventPublisher.publishCatalogUpdated("review_change");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onPartnerOrderChanged(PartnerOrderChangedEvent event) {
        invalidator.evictForPartnerOrderChange(event.partnerIds());
        realtimeEventPublisher.publishCatalogUpdated("partner_order_change");
    }
}
