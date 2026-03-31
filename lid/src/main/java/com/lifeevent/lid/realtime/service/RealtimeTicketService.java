package com.lifeevent.lid.realtime.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeevent.lid.realtime.config.RealtimeProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RealtimeTicketService {

    private static final String REDIS_TICKET_PREFIX = "lid:realtime:ws-access:";

    private final RealtimeProperties properties;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final ConcurrentHashMap<String, RealtimeTicketContext> tickets = new ConcurrentHashMap<>();

    public RealtimeTicketService(RealtimeProperties properties,
                                 ObjectMapper objectMapper,
                                 ObjectProvider<StringRedisTemplate> redisTemplateProvider) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.redisTemplateProvider = redisTemplateProvider;
    }

    public RealtimeTicketContext createTicket(String userId, Set<String> roles, List<String> requestedTopics) {
        String ticket = UUID.randomUUID().toString();
        Set<String> safeRoles = roles == null ? Set.of() : new LinkedHashSet<>(roles);
        Set<String> safeTopics = resolveTopics(safeRoles, requestedTopics);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(Math.max(5L, properties.getTicket().getTtlSeconds()));

        RealtimeTicketContext context = new RealtimeTicketContext(ticket, userId, safeRoles, safeTopics, expiresAt);
        storeTicket(context);
        return context;
    }

    public RealtimeTicketContext createPublicTicket(List<String> requestedTopics) {
        String ticket = UUID.randomUUID().toString();
        Set<String> safeTopics = resolvePublicTopics(requestedTopics);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(Math.max(5L, properties.getTicket().getTtlSeconds()));

        RealtimeTicketContext context = new RealtimeTicketContext(ticket, "anonymous", Set.of(), safeTopics, expiresAt);
        storeTicket(context);
        return context;
    }

    public RealtimeTicketContext consumeTicket(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return null;
        }
        String normalizedTicket = ticket.trim();
        RealtimeTicketContext context = consumeStoredTicket(normalizedTicket);
        if (context == null) {
            context = tickets.remove(normalizedTicket);
        }
        if (context == null) {
            return null;
        }
        if (context.expiresAt() == null || context.expiresAt().isBefore(LocalDateTime.now())) {
            return null;
        }
        return context;
    }

    private void storeTicket(RealtimeTicketContext context) {
        if (context == null || context.ticket() == null || context.ticket().isBlank()) {
            return;
        }
        if (!useRedisStore()) {
            tickets.put(context.ticket(), context);
            return;
        }
        try {
            StoredTicket stored = new StoredTicket(
                    context.ticket(),
                    context.userId(),
                    context.roles() == null ? List.of() : List.copyOf(context.roles()),
                    context.topics() == null ? List.of() : List.copyOf(context.topics()),
                    context.expiresAt()
            );
            String payload = objectMapper.writeValueAsString(stored);
            StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
            if (redis == null) {
                tickets.put(context.ticket(), context);
                return;
            }
            long ttl = Math.max(5L, properties.getTicket().getTtlSeconds());
            redis.opsForValue().set(redisKey(context.ticket()), payload, ttl, TimeUnit.SECONDS);
        } catch (Exception ex) {
            log.warn("Unable to persist realtime ws-access in redis. Falling back to local memory.");
            tickets.put(context.ticket(), context);
        }
    }

    private RealtimeTicketContext consumeStoredTicket(String ticket) {
        if (!useRedisStore()) {
            return null;
        }
        StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
        if (redis == null) {
            return null;
        }
        try {
            String key = redisKey(ticket);
            String payload = redis.opsForValue().get(key);
            if (payload == null || payload.isBlank()) {
                return null;
            }
            redis.delete(key);
            StoredTicket stored = objectMapper.readValue(payload, StoredTicket.class);
            Set<String> roles = stored.roles == null ? Set.of() : new LinkedHashSet<>(stored.roles);
            Set<String> topics = stored.topics == null ? Set.of() : new LinkedHashSet<>(stored.topics);
            return new RealtimeTicketContext(stored.ticket, stored.userId, roles, topics, stored.expiresAt);
        } catch (Exception ex) {
            log.warn("Unable to consume realtime ws-access from redis.", ex);
            return null;
        }
    }

    private boolean useRedisStore() {
        return properties.isRedisEnabled();
    }

    private String redisKey(String ticket) {
        return REDIS_TICKET_PREFIX + ticket;
    }

    private static final class StoredTicket {
        public String ticket;
        public String userId;
        public List<String> roles;
        public List<String> topics;
        public LocalDateTime expiresAt;

        public StoredTicket() {
        }

        private StoredTicket(String ticket, String userId, List<String> roles, List<String> topics, LocalDateTime expiresAt) {
            this.ticket = ticket;
            this.userId = userId;
            this.roles = roles;
            this.topics = topics;
            this.expiresAt = expiresAt;
        }
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
