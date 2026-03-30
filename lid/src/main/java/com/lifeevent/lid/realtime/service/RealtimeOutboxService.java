package com.lifeevent.lid.realtime.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeevent.lid.realtime.config.RealtimeProperties;
import com.lifeevent.lid.realtime.dto.RealtimeEnvelope;
import com.lifeevent.lid.realtime.entity.RealtimeOutboxEntity;
import com.lifeevent.lid.realtime.pubsub.RealtimeMessageDistributor;
import com.lifeevent.lid.realtime.repository.RealtimeOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RealtimeOutboxService {

    private final RealtimeOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final RealtimeProperties properties;
    private final RealtimeMessageDistributor messageDistributor;

    public void enqueue(String topic,
                        String eventType,
                        Map<String, Object> payload,
                        String dedupeKey) {
        if (!properties.isEnabled()) {
            return;
        }

        RealtimeEnvelope envelope = RealtimeEnvelope.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .topic(topic)
                .occurredAt(LocalDateTime.now())
                .version(1)
                .payload(payload == null ? Map.of() : payload)
                .build();

        String payloadJson = toJson(envelope);
        RealtimeOutboxEntity entity = RealtimeOutboxEntity.builder()
                .topic(topic)
                .eventType(eventType)
                .payloadJson(payloadJson)
                .createdAt(LocalDateTime.now())
                .attempts(0)
                .dedupeKey(dedupeKey)
                .build();
        RealtimeOutboxEntity saved = outboxRepository.save(entity);

        // In local/single-instance mode (no Redis), dispatch immediately to avoid refresh lag/regression.
        if (!properties.isRedisEnabled()) {
            messageDistributor.publish(payloadJson);
            saved.setPublishedAt(LocalDateTime.now());
            saved.setAttempts(1);
            saved.setLastError(null);
            outboxRepository.save(saved);
        }
    }

    private String toJson(RealtimeEnvelope envelope) {
        try {
            return objectMapper.writeValueAsString(envelope);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to serialize realtime outbox envelope", ex);
        }
    }
}
