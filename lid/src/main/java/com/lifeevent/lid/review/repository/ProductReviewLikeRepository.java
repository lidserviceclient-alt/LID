package com.lifeevent.lid.review.repository;

import com.lifeevent.lid.review.entity.ProductReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductReviewLikeRepository extends JpaRepository<ProductReviewLike, Long> {
    Optional<ProductReviewLike> findByReviewIdAndUserUserId(Long reviewId, String userId);

    List<ProductReviewLike> findByUserUserIdAndReviewIdIn(String userId, Collection<Long> reviewIds);
}
