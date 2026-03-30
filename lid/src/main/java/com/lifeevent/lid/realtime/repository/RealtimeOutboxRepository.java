package com.lifeevent.lid.realtime.repository;

import com.lifeevent.lid.realtime.entity.RealtimeOutboxEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RealtimeOutboxRepository extends JpaRepository<RealtimeOutboxEntity, Long> {

    @Query(value = """
            SELECT *
            FROM realtime_outbox
            WHERE published_at IS NULL
              AND attempts < :maxAttempts
            ORDER BY created_at ASC
            LIMIT :batchSize
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    List<RealtimeOutboxEntity> lockPending(@Param("batchSize") int batchSize,
                                           @Param("maxAttempts") int maxAttempts);

    Page<RealtimeOutboxEntity> findByPublishedAtIsNullAndAttemptsLessThanOrderByCreatedAtAsc(int maxAttempts,
                                                                                               Pageable pageable);
}
