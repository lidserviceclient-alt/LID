package com.lifeevent.lid.realtime.config;

import com.lifeevent.lid.realtime.ws.RealtimeTicketHandshakeInterceptor;
import com.lifeevent.lid.realtime.ws.RealtimeWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class RealtimeWebSocketConfig implements WebSocketConfigurer {

    private final RealtimeWebSocketHandler realtimeWebSocketHandler;
    private final RealtimeTicketHandshakeInterceptor realtimeTicketHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(realtimeWebSocketHandler, "/api/v1/realtime/ws", "/api/realtime/ws")
                .addInterceptors(realtimeTicketHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
