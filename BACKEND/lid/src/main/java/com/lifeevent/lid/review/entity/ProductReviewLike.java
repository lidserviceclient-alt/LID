package com.lifeevent.lid.review.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.user.common.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(
        name = "product_review_like",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_product_review_like_user_review", columnNames = {"review_id", "user_id"})
        }
)
public class ProductReviewLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "review_id", nullable = false)
    private ProductReview review;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}
