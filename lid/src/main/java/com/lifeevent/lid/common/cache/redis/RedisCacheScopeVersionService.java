package com.lifeevent.lid.common.cache.redis;

import com.lifeevent.lid.common.cache.CacheScopeVersionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component("cacheScopeVersionService")
@Profile({"prod", "db-prod"})
public class RedisCacheScopeVersionService implements CacheScopeVersionService {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheScopeVersionService.class);
    private static final String REDIS_PREFIX = "cache-scope-version:v1:";
    private static final String CATALOG_KEY = REDIS_PREFIX + "catalog";
    private static final String PRODUCT_GLOBAL_KEY = REDIS_PREFIX + "product-global";
    private static final String BLOG_KEY = REDIS_PREFIX + "blog";
    private static final String TICKET_KEY = REDIS_PREFIX + "ticket";
    private static final String PARTNER_GLOBAL_KEY = REDIS_PREFIX + "partner-global";
    private static final String REVIEW_GLOBAL_KEY = REDIS_PREFIX + "review-global";
    private static final String MARKETING_KEY = REDIS_PREFIX + "marketing";
    private static final String LOYALTY_KEY = REDIS_PREFIX + "loyalty";
    private static final String PARTNER_KEY_PREFIX = REDIS_PREFIX + "partner:";
    private static final String REVIEW_KEY_PREFIX = REDIS_PREFIX + "review:";
    private static final long SCOPED_KEY_TTL_HOURS = 24L;

    private final StringRedisTemplate redisTemplate;

    public RedisCacheScopeVersionService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public long catalogVersion() {
        return readCounter(CATALOG_KEY);
    }

    @Override
    public void bumpCatalog() {
        incrementCounter(CATALOG_KEY);
    }

    @Override
    public long productGlobalVersion() {
        return readCounter(PRODUCT_GLOBAL_KEY);
    }

    @Override
    public void bumpProductGlobal() {
        incrementCounter(PRODUCT_GLOBAL_KEY);
    }

    @Override
    public long blogVersion() {
        return readCounter(BLOG_KEY);
    }

    @Override
    public void bumpBlog() {
        incrementCounter(BLOG_KEY);
    }

    @Override
    public long ticketVersion() {
        return readCounter(TICKET_KEY);
    }

    @Override
    public void bumpTicket() {
        incrementCounter(TICKET_KEY);
    }

    @Override
    public long partnerVersion(String partnerId) {
        long global = readCounter(PARTNER_GLOBAL_KEY);
        if (partnerId == null || partnerId.isBlank()) {
            return global;
        }
        return global + readCounter(partnerRedisKey(partnerId));
    }

    @Override
    public String partnerVersionToken(String partnerId) {
        long global = readCounter(PARTNER_GLOBAL_KEY);
        if (partnerId == null || partnerId.isBlank()) {
            return global + ":0";
        }
        return global + ":" + readCounter(partnerRedisKey(partnerId));
    }

    @Override
    public void bumpPartner(String partnerId) {
        if (partnerId == null || partnerId.isBlank()) {
            bumpAllPartners();
            return;
        }
        incrementScopedCounter(partnerRedisKey(partnerId));
    }

    @Override
    public void bumpPartners(Set<String> partnerIds) {
        if (partnerIds == null || partnerIds.isEmpty()) {
            bumpAllPartners();
            return;
        }
        for (String partnerId : partnerIds) {
            bumpPartner(partnerId);
        }
    }

    @Override
    public void bumpAllPartners() {
        incrementCounter(PARTNER_GLOBAL_KEY);
    }

    @Override
    public long reviewVersion(Long productId) {
        long global = readCounter(REVIEW_GLOBAL_KEY);
        if (productId == null) {
            return global;
        }
        return global + readCounter(reviewRedisKey(productId));
    }

    @Override
    public String reviewVersionToken(Long productId) {
        long global = readCounter(REVIEW_GLOBAL_KEY);
        if (productId == null) {
            return global + ":0";
        }
        return global + ":" + readCounter(reviewRedisKey(productId));
    }

    @Override
    public void bumpReview(Set<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            incrementCounter(REVIEW_GLOBAL_KEY);
            return;
        }
        for (Long productId : productIds) {
            if (productId == null) {
                continue;
            }
            incrementScopedCounter(reviewRedisKey(productId));
        }
    }

    @Override
    public long marketingVersion() {
        return readCounter(MARKETING_KEY);
    }

    @Override
    public void bumpMarketing() {
        incrementCounter(MARKETING_KEY);
    }

    @Override
    public long loyaltyVersion() {
        return readCounter(LOYALTY_KEY);
    }

    @Override
    public void bumpLoyalty() {
        incrementCounter(LOYALTY_KEY);
    }

    private long readCounter(String key) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            return value == null ? 0L : Long.parseLong(value);
        } catch (Exception ex) {
            log.warn("Failed to read distributed cache scope version key={}", key, ex);
            return 0L;
        }
    }

    private void incrementCounter(String key) {
        try {
            redisTemplate.opsForValue().increment(key);
        } catch (Exception ex) {
            log.warn("Failed to increment distributed cache scope version key={}", key, ex);
        }
    }

    private void incrementScopedCounter(String key) {
        try {
            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, SCOPED_KEY_TTL_HOURS, TimeUnit.HOURS);
        } catch (Exception ex) {
            log.warn("Failed to increment distributed scoped cache version key={}", key, ex);
        }
    }

    private String partnerRedisKey(String partnerId) {
        return PARTNER_KEY_PREFIX + partnerId;
    }

    private String reviewRedisKey(Long productId) {
        return REVIEW_KEY_PREFIX + productId;
    }
}
