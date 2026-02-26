package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateProductReviewRequest;
import com.lifeevent.lid.core.dto.ProductReviewDto;
import com.lifeevent.lid.core.dto.ProductReviewsResponse;
import com.lifeevent.lid.core.dto.ReportProductReviewRequest;
import com.lifeevent.lid.core.service.ProductReviewService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalog")
public class PublicCatalogReviewsController {

    private final ProductReviewService productReviewService;

    public PublicCatalogReviewsController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ProductReviewsResponse list(@PathVariable String productId,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        return productReviewService.listProductReviews(productId, page, size);
    }

    @PostMapping("/products/{productId}/reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    public ProductReviewDto upsert(@PathVariable String productId, @Valid @RequestBody CreateProductReviewRequest request) {
        return productReviewService.upsertReview(productId, request);
    }

    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    public void delete(@PathVariable String reviewId) {
        productReviewService.deleteReview(reviewId);
    }

    @PostMapping("/reviews/{reviewId}/like")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    public long like(@PathVariable String reviewId) {
        return productReviewService.toggleLike(reviewId);
    }

    @PostMapping("/reviews/{reviewId}/report")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    public void report(@PathVariable String reviewId, @Valid @RequestBody ReportProductReviewRequest request) {
        productReviewService.reportReview(reviewId, request);
    }
}

