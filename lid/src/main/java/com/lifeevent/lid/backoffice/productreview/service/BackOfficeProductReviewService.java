package com.lifeevent.lid.backoffice.productreview.service;

import com.lifeevent.lid.backoffice.productreview.dto.BackOfficeProductReviewDto;
import com.lifeevent.lid.backoffice.productreview.dto.BackOfficeUpdateProductReviewRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeProductReviewService {
    Page<BackOfficeProductReviewDto> getReviews(Pageable pageable, String q, String productId, String userId, String status);
    BackOfficeProductReviewDto getReview(String id);
    BackOfficeProductReviewDto updateReview(String id, BackOfficeUpdateProductReviewRequest request);
    BackOfficeProductReviewDto validateReview(String id);
    BackOfficeProductReviewDto unvalidateReview(String id);
    BackOfficeProductReviewDto restoreReview(String id);
    void deleteReview(String id);
}
