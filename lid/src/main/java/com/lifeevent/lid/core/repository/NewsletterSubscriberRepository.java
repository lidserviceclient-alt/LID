package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.NewsletterSubscriber;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, String> {

    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);

    long countByStatus(NewsletterSubscriberStatus status);

    @Query("""
            select s.email from NewsletterSubscriber s
            where s.status = :status
            """)
    List<String> findEmailsByStatus(@Param("status") NewsletterSubscriberStatus status);

    @Query("""
            select s from NewsletterSubscriber s
            where (:status is null or s.status = :status)
              and (
                :q is null
                or lower(s.email) like concat('%', lower(:q), '%')
              )
            """)
    Page<NewsletterSubscriber> search(@Param("status") NewsletterSubscriberStatus status, @Param("q") String q, Pageable pageable);
}
