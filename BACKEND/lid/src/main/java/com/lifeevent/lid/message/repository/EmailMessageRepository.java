package com.lifeevent.lid.message.repository;

import com.lifeevent.lid.message.entity.EmailMessage;
import com.lifeevent.lid.message.enumeration.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessage, Long> {
    Page<EmailMessage> findByCreatedAtGreaterThanEqual(LocalDateTime since, Pageable pageable);

    long countByCreatedAtGreaterThanEqual(LocalDateTime since);

    List<EmailMessage> findByStatusAndNextRetryAtBeforeOrderByNextRetryAtAsc(MessageStatus status, LocalDateTime now);
}
