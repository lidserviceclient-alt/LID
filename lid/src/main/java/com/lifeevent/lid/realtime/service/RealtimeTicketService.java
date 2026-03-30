package com.lifeevent.lid.realtime.service;

import com.lifeevent.lid.realtime.config.RealtimeProperties;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RealtimeTicketService {

    private final RealtimeProperties properties;
    private final ConcurrentHashMap<String, RealtimeTicketContext> tickets = new ConcurrentHashMap<>();

    public RealtimeTicketService(RealtimeProperties properties) {
        this.properties = properties;
    }

    public RealtimeTicketContext createTicket(String userId, Set<String> roles, List<String> requestedTopics) {
        String ticket = UUID.randomUUID().toString();
        Set<String> safeRoles = roles == null ? Set.of() : new LinkedHashSet<>(roles);
        Set<String> safeTopics = resolveTopics(safeRoles, requestedTopics);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(Math.max(5L, properties.getTicket().getTtlSeconds()));

        RealtimeTicketContext context = new RealtimeTicketContext(ticket, userId, safeRoles, safeTopics, expiresAt);
        tickets.put(ticket, context);
        return context;
    }

    public RealtimeTicketContext createPublicTicket(List<String> requestedTopics) {
        String ticket = UUID.randomUUID().toString();
        Set<String> safeTopics = resolvePublicTopics(requestedTopics);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(Math.max(5L, properties.getTicket().getTtlSeconds()));

        RealtimeTicketContext context = new RealtimeTicketContext(ticket, "anonymous", Set.of(), safeTopics, expiresAt);
        tickets.put(ticket, context);
        return context;
    }

    public RealtimeTicketContext consumeTicket(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return null;
        }
        RealtimeTicketContext context = tickets.remove(ticket.trim());
        if (context == null) {
            return null;
        }
        if (context.expiresAt() == null || context.expiresAt().isBefore(LocalDateTime.now())) {
            return null;
        }
        return context;
    }

    private Set<String> resolveTopics(Set<String> roles, List<String> requestedTopics) {
        Set<String> allowed = allowedTopics(roles);
        if (requestedTopics == null || requestedTopics.isEmpty()) {
            return allowed;
        }

        LinkedHashSet<String> filtered = new LinkedHashSet<>();
        for (String topic : requestedTopics) {
            if (topic == null) {
                continue;
            }
            String normalized = topic.trim();
            if (allowed.contains(normalized)) {
                filtered.add(normalized);
            }
        }
        return filtered.isEmpty() ? allowed : filtered;
    }

    private Set<String> resolvePublicTopics(List<String> requestedTopics) {
        LinkedHashSet<String> allowed = new LinkedHashSet<>();
        if (properties.getTopics().isCatalogEnabled()) {
            allowed.add(RealtimeTopics.CATALOG_UPDATED);
        }
        if (requestedTopics == null || requestedTopics.isEmpty()) {
            return allowed;
        }

        LinkedHashSet<String> filtered = new LinkedHashSet<>();
        for (String topic : requestedTopics) {
            if (topic == null) {
                continue;
            }
            String normalized = topic.trim();
            if (allowed.contains(normalized)) {
                filtered.add(normalized);
            }
        }
        return filtered.isEmpty() ? allowed : filtered;
    }

    public Set<String> allowedTopics(Set<String> roles) {
        LinkedHashSet<String> allowed = new LinkedHashSet<>();
        Set<String> safeRoles = roles == null ? Set.of() : roles;
        List<String> normalizedRoles = new ArrayList<>();
        for (String role : safeRoles) {
            if (role == null) {
                continue;
            }
            normalizedRoles.add(role.replace("ROLE_", "").trim().toUpperCase());
        }

        if (normalizedRoles.contains("ADMIN") || normalizedRoles.contains("SUPER_ADMIN")) {
            allowed.add(RealtimeTopics.BACKOFFICE_NOTIFICATIONS_COUNT_UPDATED);
            allowed.add(RealtimeTopics.BACKOFFICE_OVERVIEW_UPDATED);
            allowed.add(RealtimeTopics.DELIVERY_SHIPMENT_UPDATED);
            allowed.add(RealtimeTopics.PAYMENT_STATUS_UPDATED);
            allowed.add(RealtimeTopics.CATALOG_UPDATED);
            return allowed;
        }
        if (normalizedRoles.contains("LIVREUR")) {
            allowed.add(RealtimeTopics.BACKOFFICE_NOTIFICATIONS_COUNT_UPDATED);
            allowed.add(RealtimeTopics.DELIVERY_SHIPMENT_UPDATED);
            return allowed;
        }
        if (normalizedRoles.contains("PARTNER")) {
            allowed.add(RealtimeTopics.PAYMENT_STATUS_UPDATED);
            allowed.add(RealtimeTopics.CATALOG_UPDATED);
            return allowed;
        }
        if (normalizedRoles.contains("CUSTOMER")) {
            allowed.add(RealtimeTopics.PAYMENT_STATUS_UPDATED);
            allowed.add(RealtimeTopics.CATALOG_UPDATED);
            return allowed;
        }
        return allowed;
    }
}
