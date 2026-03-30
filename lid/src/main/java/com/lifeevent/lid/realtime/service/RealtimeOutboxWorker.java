package com.lifeevent.lid.realtime.service;

import com.lifeevent.lid.realtime.config.RealtimeProperties;
import com.lifeevent.lid.realtime.entity.RealtimeOutboxEntity;
import com.lifeevent.lid.realtime.pubsub.RealtimeMessageDistributor;
import com.lifeevent.lid.realtime.repository.RealtimeOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RealtimeOutboxWorker {

    private final RealtimeOutboxRepository outboxRepository;
    private final RealtimeMessageDistributor messageDistributor;
    private final RealtimeProperties properties;

    @Scheduled(fixedDelayString = "${config.realtime.outbox.poll-delay-ms:1000}")
    @Transactional
    public void publishPending() {
        if (!properties.isEnabled()) {
            return;
        }

        int batchSize = Math.max(1, properties.getOutbox().getBatchSize());
        int maxAttempts = Math.max(1, properties.getOutbox().getMaxAttempts());
        List<RealtimeOutboxEntity> rows;
        try {
            rows = outboxRepository.lockPending(batchSize, maxAttempts);
        } catch (Exception ex) {
            rows = outboxRepository
                    .findByPublishedAtIsNullAndAttemptsLessThanOrderByCreatedAtAsc(
                            maxAttempts,
                            PageRequest.of(0, batchSize)
                    )
                    .getContent();
        }
        if (rows.isEmpty()) {
            return;
        }

        for (RealtimeOutboxEntity row : rows) {
            try {
                messageDistributor.publish(row.getPayloadJson());
                row.setPublishedAt(LocalDateTime.now());
                row.setLastError(null);
            } catch (Exception ex) {
                row.setAttempts(safeAttempts(row.getAttempts()) + 1);
                row.setLastError(compactError(ex));
                log.warn("Realtime outbox publish failed, id={}", row.getId(), ex);
                continue;
            }
            row.setAttempts(safeAttempts(row.getAttempts()) + 1);
        }
    }

    private int safeAttempts(Integer attempts) {
        return attempts == null ? 0 : attempts;
    }

    private String compactError(Exception ex) {
        if (ex == null || ex.getMessage() == null) {
            return "unknown_error";
        }
        String raw = ex.getMessage().trim();
        return raw.length() > 1900 ? raw.substring(0, 1900) : raw;
    }
}
