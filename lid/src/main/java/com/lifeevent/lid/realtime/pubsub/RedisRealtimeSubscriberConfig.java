package com.lifeevent.lid.realtime.pubsub;

import com.lifeevent.lid.realtime.config.RealtimeProperties;
import com.lifeevent.lid.realtime.ws.RealtimeWebSocketSessionRegistry;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
@ConditionalOnProperty(name = "config.realtime.redis-enabled", havingValue = "true")
public class RedisRealtimeSubscriberConfig {

    @Bean
    RedisMessageListenerContainer realtimeRedisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter realtimeRedisListener,
            RealtimeProperties properties
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(realtimeRedisListener, new ChannelTopic(properties.getRedisChannel()));
        return container;
    }

    @Bean
    MessageListenerAdapter realtimeRedisListenerAdapter(MessageListener listener) {
        return new MessageListenerAdapter(listener);
    }

    @Bean
    MessageListener realtimeRedisListener(RealtimeWebSocketSessionRegistry sessionRegistry) {
        return new MessageListener() {
            @Override
            public void onMessage(Message message, byte[] pattern) {
                if (message == null || message.getBody() == null) {
                    return;
                }
                sessionRegistry.dispatchRaw(new String(message.getBody()));
            }
        };
    }
}
