package com.lifeevent.lid.backoffice.productreview.service.impl;

import com.lifeevent.lid.backoffice.productreview.dto.BackOfficeProductReviewDto;
import com.lifeevent.lid.backoffice.productreview.dto.BackOfficeUpdateProductReviewRequest;
import com.lifeevent.lid.backoffice.productreview.service.BackOfficeProductReviewService;
import com.lifeevent.lid.review.entity.ProductReview;
import com.lifeevent.lid.review.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeProductReviewServiceImpl implements BackOfficeProductReviewService {

    private final ProductReviewRepository productReviewRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeProductReviewDto> getReviews(Pageable pageable, String q, String productId, String userId, String status) {
        String normalizedStatus = status == null ? "ALL" : status.trim().toUpperCase();
        Boolean validated = null;
        boolean reported = false;
        boolean includeDeleted = false;
        boolean deletedOnly = false;

        if ("VALIDATED".equals(normalizedStatus)) {
            validated = true;
        } else if ("PENDING".equals(normalizedStatus)) {
            validated = false;
        } else if ("REPORTED".equals(normalizedStatus)) {
            reported = true;
        } else if ("DELETED".equals(normalizedStatus)) {
            includeDeleted = true;
            deletedOnly = true;
        }

        return productReviewRepository.searchBackoffice(
                        pageable,
                        blankToNull(q),
                        blankToNull(productId),
                        blankToNull(userId),
                        validated,
                        reported,
                        includeDeleted,
                        deletedOnly
                )
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeProductReviewDto getReview(String id) {
        return toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeProductReviewDto updateReview(String id, BackOfficeUpdateProductReviewRequest request) {
        ProductReview review = findByIdOrThrow(id);

        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());
        if (request.getValidated() != null) {
            review.setValidated(request.getValidated());
        }
        review.setDeletedAt(null);

        ProductReview saved = productReviewRepository.save(review);
        return toDto(saved);
    }

    @Override
    public BackOfficeProductReviewDto validateReview(String id) {
        ProductReview review = findByIdOrThrow(id);
        review.setValidated(true);
        review.setDeletedAt(null);
        return toDto(productReviewRepository.save(review));
    }

    @Override
    public BackOfficeProductReviewDto unvalidateReview(String id) {
        ProductReview review = findByIdOrThrow(id);
        review.setValidated(false);
        return toDto(productReviewRepository.save(review));
    }

    @Override
    public BackOfficeProductReviewDto restoreReview(String id) {
        ProductReview review = findByIdOrThrow(id);
        review.setDeletedAt(null);
        return toDto(productReviewRepository.save(review));
    }

    @Override
    public void deleteReview(String id) {
        ProductReview review = findByIdOrThrow(id);
        review.setDeletedAt(LocalDateTime.now());
        productReviewRepository.save(review);
    }

    private ProductReview findByIdOrThrow(String id) {
        Long reviewId;
        try {
            reviewId = Long.parseLong(id);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Avis introuvable");
        }

        return productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Avis introuvable"));
    }

    private BackOfficeProductReviewDto toDto(ProductReview review) {
        return BackOfficeProductReviewDto.builder()
                .id(review.getId() == null ? null : String.valueOf(review.getId()))
                .productId(review.getArticle() == null || review.getArticle().getId() == null ? null : String.valueOf(review.getArticle().getId()))
                .productName(review.getArticle() == null ? null : review.getArticle().getName())
                .userId(review.getCustomer() == null ? null : review.getCustomer().getUserId())
                .userEmail(review.getCustomer() == null ? null : review.getCustomer().getEmail())
                .rating(review.getRating())
                .content(review.getContent())
                .validated(review.getValidated())
                .likeCount(review.getLikeCount() == null ? 0L : review.getLikeCount())
                .reportCount(review.getReportCount() == null ? 0L : review.getReportCount())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .deletedAt(review.getDeletedAt())
                .build();
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
