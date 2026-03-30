package com.lifeevent.lid.realtime.pubsub;

import com.lifeevent.lid.realtime.config.RealtimeProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "config.realtime.redis-enabled", havingValue = "true")
public class RedisRealtimeMessageDistributor implements RealtimeMessageDistributor {

    private final StringRedisTemplate redisTemplate;
    private final RealtimeProperties properties;

    public RedisRealtimeMessageDistributor(StringRedisTemplate redisTemplate,
                                           RealtimeProperties properties) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
    }

    @Override
    public void publish(String payloadJson) {
        redisTemplate.convertAndSend(properties.getRedisChannel(), payloadJson);
    }
}
