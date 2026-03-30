package com.lifeevent.lid.realtime.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeevent.lid.realtime.dto.RealtimeEnvelope;
import com.lifeevent.lid.realtime.service.RealtimeSessionContext;
import com.lifeevent.lid.realtime.service.RealtimeTicketContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RealtimeWebSocketHandler extends TextWebSocketHandler {

    private final RealtimeWebSocketSessionRegistry registry;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        RealtimeTicketContext ticketContext = ticketContext(session.getAttributes());
        if (ticketContext == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Missing ticket context"));
            return;
        }
        registry.register(new RealtimeSessionContext(
                session,
                ticketContext.userId(),
                ticketContext.roles(),
                ticketContext.topics()
        ));

        RealtimeEnvelope connected = RealtimeEnvelope.builder()
                .eventId("connected-" + session.getId())
                .eventType("connection.ack")
                .topic("connection.ack")
                .occurredAt(LocalDateTime.now())
                .version(1)
                .payload(Map.of(
                        "sessionId", session.getId(),
                        "topics", ticketContext.topics(),
                        "connections", registry.size()
                ))
                .build();
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(connected)));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Server push only.
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.unregister(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        registry.unregister(session);
    }

    private RealtimeTicketContext ticketContext(Map<String, Object> attributes) {
        if (attributes == null) {
            return null;
        }
        Object raw = attributes.get(RealtimeTicketHandshakeInterceptor.ATTR_TICKET_CONTEXT);
        if (raw instanceof RealtimeTicketContext context) {
            return context;
        }
        return null;
    }
}
