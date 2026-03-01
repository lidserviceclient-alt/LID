package com.lifeevent.lid.review.repository;

import com.lifeevent.lid.review.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query("""
        SELECT r
        FROM ProductReview r
        JOIN r.article a
        JOIN r.customer c
        WHERE (:q IS NULL OR :q = '' OR LOWER(r.content) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(a.name) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:productId IS NULL OR CAST(a.id as string) = :productId)
          AND (:userId IS NULL OR c.userId = :userId)
          AND (:validated IS NULL OR r.validated = :validated)
          AND (:reported = FALSE OR r.reportCount > 0)
          AND (:includeDeleted = TRUE OR r.deletedAt IS NULL)
          AND (:deletedOnly = FALSE OR r.deletedAt IS NOT NULL)
        ORDER BY r.createdAt DESC
    """)
    Page<ProductReview> searchBackoffice(
            Pageable pageable,
            @Param("q") String q,
            @Param("productId") String productId,
            @Param("userId") String userId,
            @Param("validated") Boolean validated,
            @Param("reported") boolean reported,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("deletedOnly") boolean deletedOnly
    );
}
