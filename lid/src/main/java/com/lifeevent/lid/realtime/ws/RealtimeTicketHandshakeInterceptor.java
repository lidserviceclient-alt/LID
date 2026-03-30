package com.lifeevent.lid.realtime.ws;

import com.lifeevent.lid.realtime.service.RealtimeTicketContext;
import com.lifeevent.lid.realtime.service.RealtimeTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RealtimeTicketHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_TICKET_CONTEXT = "realtimeTicketContext";

    private final RealtimeTicketService ticketService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        var queryParams = UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams();
        String wsAccess = first(queryParams.get("ws-access"));
        if (wsAccess == null) {
            wsAccess = first(queryParams.get("wsAccess"));
        }
        if (wsAccess == null) {
            wsAccess = first(queryParams.get("ticket"));
        }

        RealtimeTicketContext context = ticketService.consumeTicket(wsAccess);
        if (context == null) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
        attributes.put(ATTR_TICKET_CONTEXT, context);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }

    private String first(List<String> values) {
        return (values == null || values.isEmpty()) ? null : values.get(0);
    }
}
