package com.lifeevent.lid.realtime.pubsub;

import com.lifeevent.lid.realtime.ws.RealtimeWebSocketSessionRegistry;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "config.realtime.redis-enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryRealtimeMessageDistributor implements RealtimeMessageDistributor {

    private final RealtimeWebSocketSessionRegistry sessionRegistry;

    public InMemoryRealtimeMessageDistributor(RealtimeWebSocketSessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void publish(String payloadJson) {
        sessionRegistry.dispatchRaw(payloadJson);
    }
}
