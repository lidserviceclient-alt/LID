package com.lifeevent.lid.realtime.service;

import org.springframework.web.socket.WebSocketSession;

import java.util.Set;

public record RealtimeSessionContext(
        WebSocketSession session,
        String userId,
        Set<String> roles,
        Set<String> topics
) {
}
