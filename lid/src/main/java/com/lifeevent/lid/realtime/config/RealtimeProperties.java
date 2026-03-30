package com.lifeevent.lid.realtime.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "config.realtime")
public class RealtimeProperties {

    private boolean enabled = true;
    private boolean redisEnabled = false;
    private String redisChannel = "lid:realtime:v1";

    private final Outbox outbox = new Outbox();
    private final Ticket ticket = new Ticket();
    private final Heartbeat heartbeat = new Heartbeat();
    private final Topics topics = new Topics();

    @Getter
    @Setter
    public static class Outbox {
        private long pollDelayMs = 1000;
        private int batchSize = 100;
        private int maxAttempts = 20;
    }

    @Getter
    @Setter
    public static class Ticket {
        private long ttlSeconds = 30;
    }

    @Getter
    @Setter
    public static class Heartbeat {
        private long intervalSeconds = 25;
    }

    @Getter
    @Setter
    public static class Topics {
        private boolean backofficeNotificationsEnabled = true;
        private boolean backofficeOverviewEnabled = true;
        private boolean deliveryShipmentEnabled = true;
        private boolean paymentStatusEnabled = true;
        private boolean catalogEnabled = false;
    }
}
