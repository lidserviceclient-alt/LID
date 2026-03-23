package com.lifeevent.lid.common.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Component("cacheScopeVersionService")
public class CacheScopeVersionService {

    private static final Logger log = LoggerFactory.getLogger(CacheScopeVersionService.class);
    private static final long PARTNER_VERSION_MAX_SIZE = 50_000L;
    private static final long REVIEW_VERSION_MAX_SIZE = 100_000L;
    private static final long PARTNER_WARN_THRESHOLD = 45_000L;
    private static final long REVIEW_WARN_THRESHOLD = 90_000L;

    private final AtomicLong catalogVersion = new AtomicLong(0);
    private final AtomicLong productGlobalVersion = new AtomicLong(0);
    private final AtomicLong blogVersion = new AtomicLong(0);
    private final AtomicLong ticketVersion = new AtomicLong(0);
    private final AtomicLong partnerGlobalVersion = new AtomicLong(0);
    private final AtomicLong reviewGlobalVersion = new AtomicLong(0);
    private final AtomicLong marketingVersion = new AtomicLong(0);
    private final AtomicLong loyaltyVersion = new AtomicLong(0);

    private final Cache<String, AtomicLong> partnerVersions = Caffeine.newBuilder()
            .maximumSize(PARTNER_VERSION_MAX_SIZE)
            .expireAfterAccess(6, TimeUnit.HOURS)
            .expireAfterWrite(24, TimeUnit.HOURS)
            .build();

    private final Cache<Long, AtomicLong> reviewVersions = Caffeine.newBuilder()
            .maximumSize(REVIEW_VERSION_MAX_SIZE)
            .expireAfterAccess(6, TimeUnit.HOURS)
            .expireAfterWrite(24, TimeUnit.HOURS)
            .build();

    public long catalogVersion() {
        return catalogVersion.get();
    }

    public void bumpCatalog() {
        catalogVersion.incrementAndGet();
    }

    public long productGlobalVersion() {
        return productGlobalVersion.get();
    }

    public void bumpProductGlobal() {
        productGlobalVersion.incrementAndGet();
    }

    public long blogVersion() {
        return blogVersion.get();
    }

    public void bumpBlog() {
        blogVersion.incrementAndGet();
    }

    public long ticketVersion() {
        return ticketVersion.get();
    }

    public void bumpTicket() {
        ticketVersion.incrementAndGet();
    }

    public long partnerVersion(String partnerId) {
        long global = partnerGlobalVersion.get();
        if (partnerId == null || partnerId.isBlank()) {
            return global;
        }
        AtomicLong local = partnerVersions.get(partnerId, ignored -> new AtomicLong(0));
        return global + local.get();
    }

    public String partnerVersionToken(String partnerId) {
        long global = partnerGlobalVersion.get();
        if (partnerId == null || partnerId.isBlank()) {
            return global + ":0";
        }
        AtomicLong local = partnerVersions.get(partnerId, ignored -> new AtomicLong(0));
        return global + ":" + local.get();
    }

    public void bumpPartner(String partnerId) {
        if (partnerId == null || partnerId.isBlank()) {
            bumpAllPartners();
            return;
        }
        partnerVersions.get(partnerId, ignored -> new AtomicLong(0)).incrementAndGet();
        maybeWarnGrowth();
    }

    public void bumpPartners(Set<String> partnerIds) {
        if (partnerIds == null || partnerIds.isEmpty()) {
            bumpAllPartners();
            return;
        }
        for (String partnerId : partnerIds) {
            bumpPartner(partnerId);
        }
    }

    public void bumpAllPartners() {
        partnerGlobalVersion.incrementAndGet();
    }

    public long reviewVersion(Long productId) {
        long global = reviewGlobalVersion.get();
        if (productId == null) {
            return global;
        }
        AtomicLong local = reviewVersions.get(productId, ignored -> new AtomicLong(0));
        return global + local.get();
    }

    public String reviewVersionToken(Long productId) {
        long global = reviewGlobalVersion.get();
        if (productId == null) {
            return global + ":0";
        }
        AtomicLong local = reviewVersions.get(productId, ignored -> new AtomicLong(0));
        return global + ":" + local.get();
    }

    public void bumpReview(Set<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            reviewGlobalVersion.incrementAndGet();
            return;
        }
        for (Long productId : productIds) {
            if (productId == null) {
                continue;
            }
            reviewVersions.get(productId, ignored -> new AtomicLong(0)).incrementAndGet();
        }
        maybeWarnGrowth();
    }

    public long marketingVersion() {
        return marketingVersion.get();
    }

    public void bumpMarketing() {
        marketingVersion.incrementAndGet();
    }

    public long loyaltyVersion() {
        return loyaltyVersion.get();
    }

    public void bumpLoyalty() {
        loyaltyVersion.incrementAndGet();
    }

    private void maybeWarnGrowth() {
        long partnerSize = partnerVersions.estimatedSize();
        long reviewSize = reviewVersions.estimatedSize();
        if (partnerSize > PARTNER_WARN_THRESHOLD) {
            log.warn("Partner version cache size is high: {} (max={})", partnerSize, PARTNER_VERSION_MAX_SIZE);
        }
        if (reviewSize > REVIEW_WARN_THRESHOLD) {
            log.warn("Review version cache size is high: {} (max={})", reviewSize, REVIEW_VERSION_MAX_SIZE);
        }
    }
}
