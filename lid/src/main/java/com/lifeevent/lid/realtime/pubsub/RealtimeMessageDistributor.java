package com.lifeevent.lid.realtime.pubsub;

public interface RealtimeMessageDistributor {
    void publish(String payloadJson);
}
