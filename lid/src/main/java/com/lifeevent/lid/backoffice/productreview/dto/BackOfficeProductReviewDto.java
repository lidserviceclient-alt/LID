package com.lifeevent.lid.backoffice.productreview.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeProductReviewDto {
    private String id;
    private String productId;
    private String productName;
    private String userId;
    private String userEmail;
    private Integer rating;
    private String content;
    private Boolean validated;
    private Long likeCount;
    private Long reportCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
