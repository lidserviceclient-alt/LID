package com.lifeevent.lid.realtime.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeevent.lid.realtime.dto.RealtimeEnvelope;
import com.lifeevent.lid.realtime.service.RealtimeSessionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class RealtimeWebSocketSessionRegistry {

    private final ObjectMapper objectMapper;
    private final Map<String, RealtimeSessionContext> sessions = new ConcurrentHashMap<>();

    public void register(RealtimeSessionContext context) {
        if (context == null || context.session() == null) {
            return;
        }
        sessions.put(context.session().getId(), context);
    }

    public void unregister(WebSocketSession session) {
        if (session == null) {
            return;
        }
        sessions.remove(session.getId());
    }

    public int size() {
        return sessions.size();
    }

    public void dispatch(RealtimeEnvelope envelope) {
        if (envelope == null || envelope.getTopic() == null) {
            return;
        }
        sessions.values().forEach(context -> {
            if (context == null || context.session() == null || !context.session().isOpen()) {
                return;
            }
            if (context.topics() != null && !context.topics().isEmpty() && !context.topics().contains(envelope.getTopic())) {
                return;
            }
            try {
                context.session().sendMessage(new TextMessage(objectMapper.writeValueAsString(envelope)));
            } catch (Exception ex) {
                log.debug("WS dispatch failed for sessionId={}", context.session().getId(), ex);
            }
        });
    }

    public void dispatchRaw(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return;
        }
        try {
            RealtimeEnvelope envelope = objectMapper.readValue(payloadJson, RealtimeEnvelope.class);
            dispatch(envelope);
        } catch (Exception ex) {
            log.warn("Unable to parse realtime payload from outbox/pubsub", ex);
        }
    }
}
