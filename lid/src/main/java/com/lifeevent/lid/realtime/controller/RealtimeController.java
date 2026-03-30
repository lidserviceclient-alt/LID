package com.lifeevent.lid.realtime.controller;

import com.lifeevent.lid.realtime.config.RealtimeProperties;
import com.lifeevent.lid.realtime.dto.RealtimeTicketRequestDto;
import com.lifeevent.lid.realtime.dto.RealtimeTicketResponseDto;
import com.lifeevent.lid.realtime.service.RealtimeTicketContext;
import com.lifeevent.lid.realtime.service.RealtimeTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/realtime")
public class RealtimeController {

    private final RealtimeTicketService ticketService;
    private final RealtimeProperties properties;

    public RealtimeController(RealtimeTicketService ticketService, RealtimeProperties properties) {
        this.ticketService = ticketService;
        this.properties = properties;
    }

    @PostMapping("/ws-access")
    public ResponseEntity<RealtimeTicketResponseDto> createTicket(
            Authentication authentication,
            @RequestBody(required = false) RealtimeTicketRequestDto request
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).build();
        }
        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        RealtimeTicketContext context = ticketService.createTicket(
                authentication.getName(),
                roles,
                request == null ? null : request.getTopics()
        );

        return ResponseEntity.ok(RealtimeTicketResponseDto.builder()
                .wsAccess(context.ticket())
                .ttlSeconds(properties.getTicket().getTtlSeconds())
                .topics(List.copyOf(context.topics()))
                .wsPath("/api/v1/realtime/ws")
                .build());
    }

    @PostMapping("/ws-access/public")
    public ResponseEntity<RealtimeTicketResponseDto> createPublicTicket(
            @RequestBody(required = false) RealtimeTicketRequestDto request
    ) {
        RealtimeTicketContext context = ticketService.createPublicTicket(
                request == null ? null : request.getTopics()
        );

        if (context.topics() == null || context.topics().isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(RealtimeTicketResponseDto.builder()
                .wsAccess(context.ticket())
                .ttlSeconds(properties.getTicket().getTtlSeconds())
                .topics(List.copyOf(context.topics()))
                .wsPath("/api/v1/realtime/ws")
                .build());
    }
}
