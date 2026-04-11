package com.lifeevent.lid.common.cache.redis;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.lifeevent.lid.common.cache.CacheConfigurationSupport;
import com.lifeevent.lid.common.cache.CatalogCacheProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.CacheResolver;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cache.support.CompositeCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@Profile({"prod", "db-prod"})
@EnableCaching
@EnableConfigurationProperties(CatalogCacheProperties.class)
public class CacheConfigProd implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfigProd.class);

    private final CatalogCacheProperties properties;
    private final RedisConnectionFactory redisConnectionFactory;

    public CacheConfigProd(CatalogCacheProperties properties, RedisConnectionFactory redisConnectionFactory) {
        this.properties = properties;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @Bean
    @Override
    public CacheManager cacheManager() {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(redisValueSerializer()))
                .computePrefixWith(cacheName -> "v4::" + cacheName + "::")
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> perCacheConfigurations = CacheConfigurationSupport.cacheSpecs(properties)
                .stream()
                .collect(Collectors.toMap(
                        CacheConfigurationSupport.CacheSpec::name,
                        spec -> defaultConfig.entryTtl(Duration.ofMinutes(spec.ttlMinutes()))
                ));

        RedisCacheManager redisCacheManager = RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCacheConfigurations)
                .transactionAware()
                .build();

        CompositeCacheManager composite = new CompositeCacheManager(redisCacheManager);
        composite.setFallbackToNoOpCache(true);
        return composite;
    }

    @Bean(name = "cacheErrorHandler")
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache GET error on cache={} key={}, fallback to method execution", cacheName(cache), key, exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis cache PUT error on cache={} key={}, continue without cache write", cacheName(cache), key, exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache EVICT error on cache={} key={}, continue", cacheName(cache), key, exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis cache CLEAR error on cache={}, continue", cacheName(cache), exception);
            }

            private String cacheName(Cache cache) {
                return cache == null ? "unknown" : cache.getName();
            }
        };
    }

    private GenericJackson2JsonRedisSerializer redisValueSerializer() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(mapper);
    }

    @Override
    public KeyGenerator keyGenerator() {
        return null;
    }

    @Override
    public CacheResolver cacheResolver() {
        return null;
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return cacheErrorHandler();
    }
}
