package com.lifeevent.lid.review.repository;

import com.lifeevent.lid.review.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

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

    @Query("""
        SELECT r
        FROM ProductReview r
        WHERE r.article.id = :articleId
          AND r.validated = true
          AND r.deletedAt IS NULL
        ORDER BY r.createdAt DESC
    """)
    Page<ProductReview> findPublicByArticleId(
            @Param("articleId") Long articleId,
            Pageable pageable
    );

    @Query("""
        SELECT r
        FROM ProductReview r
        WHERE r.article.id = :articleId
          AND r.customer.userId = :customerUserId
    """)
    Optional<ProductReview> findByArticleIdAndCustomerUserId(
            @Param("articleId") Long articleId,
            @Param("customerUserId") String customerUserId
    );

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM ProductReview r
        WHERE r.article.id = :articleId
          AND r.validated = true
          AND r.deletedAt IS NULL
    """)
    Double avgPublicRatingByArticleId(@Param("articleId") Long articleId);

    @Query("""
        SELECT COUNT(r)
        FROM ProductReview r
        WHERE r.article.id = :articleId
          AND r.validated = true
          AND r.deletedAt IS NULL
    """)
    long countPublicByArticleId(@Param("articleId") Long articleId);
}
