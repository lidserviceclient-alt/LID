package com.lifeevent.lid.common.cache.caffeine;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.lifeevent.lid.common.cache.CacheConfigurationSupport;
import com.lifeevent.lid.common.cache.CatalogCacheProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@Profile({"local", "ddl-postgres"})
@EnableCaching
@EnableConfigurationProperties(CatalogCacheProperties.class)
public class CacheConfigLocal {

    private final CatalogCacheProperties properties;

    public CacheConfigLocal(CatalogCacheProperties properties) {
        this.properties = properties;
    }

    @Bean
    public CacheManager cacheManager() {
        List<CaffeineCache> caches = CacheConfigurationSupport.cacheSpecs(properties)
                .stream()
                .map(this::buildCache)
                .toList();
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(caches);
        return manager;
    }

    private CaffeineCache buildCache(CacheConfigurationSupport.CacheSpec spec) {
        return new CaffeineCache(spec.name(), Caffeine.newBuilder()
                .expireAfterWrite(spec.ttlMinutes(), TimeUnit.MINUTES)
                .maximumSize(spec.maxSize())
                .recordStats()
                .build());
    }
}
