package com.lifeevent.lid.backoffice.lid.productreview.controller;

import com.lifeevent.lid.backoffice.lid.productreview.dto.BackOfficeProductReviewDto;
import com.lifeevent.lid.backoffice.lid.productreview.dto.BackOfficeUpdateProductReviewRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public interface IBackOfficeProductReviewController {

    @GetMapping
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeProductReviewDto>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status
    );

    @GetMapping("/{id}")
    ResponseEntity<BackOfficeProductReviewDto> getReview(@PathVariable String id);

    @PutMapping("/{id}")
    ResponseEntity<BackOfficeProductReviewDto> updateReview(@PathVariable String id, @Valid @RequestBody BackOfficeUpdateProductReviewRequest request);

    @PostMapping("/{id}/validate")
    ResponseEntity<BackOfficeProductReviewDto> validateReview(@PathVariable String id);

    @PostMapping("/{id}/unvalidate")
    ResponseEntity<BackOfficeProductReviewDto> unvalidateReview(@PathVariable String id);

    @PostMapping("/{id}/restore")
    ResponseEntity<BackOfficeProductReviewDto> restoreReview(@PathVariable String id);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteReview(@PathVariable String id);
}
