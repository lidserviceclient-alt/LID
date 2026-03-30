package com.lifeevent.lid.realtime.service;

import java.time.LocalDateTime;
import java.util.Set;

public record RealtimeTicketContext(
        String ticket,
        String userId,
        Set<String> roles,
        Set<String> topics,
        LocalDateTime expiresAt
) {
}
