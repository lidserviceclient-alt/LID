package com.lifeevent.lid.review.repository;

import com.lifeevent.lid.review.entity.ProductReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductReviewReportRepository extends JpaRepository<ProductReviewReport, Long> {
    Optional<ProductReviewReport> findByReviewIdAndUserUserId(Long reviewId, String userId);
}
