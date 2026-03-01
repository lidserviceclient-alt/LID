package com.lifeevent.lid.newsletter.repository;

import com.lifeevent.lid.newsletter.entity.NewsletterSubscriber;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, String> {

    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);

    long countByStatus(NewsletterSubscriberStatus status);

    @Query("""
        SELECT n
        FROM NewsletterSubscriber n
        WHERE (:status IS NULL OR n.status = :status)
          AND (:q IS NULL OR :q = '' OR LOWER(n.email) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY n.createdAt DESC
    """)
    Page<NewsletterSubscriber> search(
            @Param("status") NewsletterSubscriberStatus status,
            @Param("q") String query,
            Pageable pageable
    );

    @Query("""
        SELECT n.email
        FROM NewsletterSubscriber n
        WHERE n.status = :status
    """)
    List<String> findEmailsByStatus(@Param("status") NewsletterSubscriberStatus status);
}
