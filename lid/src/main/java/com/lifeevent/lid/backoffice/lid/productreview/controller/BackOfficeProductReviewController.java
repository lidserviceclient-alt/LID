package com.lifeevent.lid.backoffice.lid.productreview.controller;

import com.lifeevent.lid.backoffice.lid.productreview.dto.BackOfficeProductReviewDto;
import com.lifeevent.lid.backoffice.lid.productreview.dto.BackOfficeUpdateProductReviewRequest;
import com.lifeevent.lid.backoffice.lid.productreview.service.BackOfficeProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/product-reviews", "/api/backoffice/product-reviews"})
@RequiredArgsConstructor
public class BackOfficeProductReviewController implements IBackOfficeProductReviewController {

    private final BackOfficeProductReviewService backOfficeProductReviewService;

    @Override
    public ResponseEntity<Page<BackOfficeProductReviewDto>> getReviews(int page, int size, String q, String productId, String userId, String status) {
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.max(size, 1));
        return ResponseEntity.ok(backOfficeProductReviewService.getReviews(pageable, q, productId, userId, status));
    }

    @Override
    public ResponseEntity<BackOfficeProductReviewDto> getReview(String id) {
        return ResponseEntity.ok(backOfficeProductReviewService.getReview(id));
    }

    @Override
    public ResponseEntity<BackOfficeProductReviewDto> updateReview(String id, BackOfficeUpdateProductReviewRequest request) {
        return ResponseEntity.ok(backOfficeProductReviewService.updateReview(id, request));
    }

    @Override
    public ResponseEntity<BackOfficeProductReviewDto> validateReview(String id) {
        return ResponseEntity.ok(backOfficeProductReviewService.validateReview(id));
    }

    @Override
    public ResponseEntity<BackOfficeProductReviewDto> unvalidateReview(String id) {
        return ResponseEntity.ok(backOfficeProductReviewService.unvalidateReview(id));
    }

    @Override
    public ResponseEntity<BackOfficeProductReviewDto> restoreReview(String id) {
        return ResponseEntity.ok(backOfficeProductReviewService.restoreReview(id));
    }

    @Override
    public ResponseEntity<Void> deleteReview(String id) {
        backOfficeProductReviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
