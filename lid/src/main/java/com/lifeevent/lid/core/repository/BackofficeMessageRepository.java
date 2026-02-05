package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.BackofficeMessage;
import com.lifeevent.lid.core.enums.BackofficeMessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BackofficeMessageRepository extends JpaRepository<BackofficeMessage, String> {
    Page<BackofficeMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<BackofficeMessage> findByStatusAndNextRetryAtBeforeOrderByNextRetryAtAsc(BackofficeMessageStatus status, LocalDateTime now);
}

