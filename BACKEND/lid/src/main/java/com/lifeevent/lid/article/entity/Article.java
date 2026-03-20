package com.lifeevent.lid.article.entity;

import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "article",
        uniqueConstraints = @UniqueConstraint(columnNames = "sku"),
        indexes = {
                @Index(name = "idx_article_status_updated_at", columnList = "status, updated_at"),
                @Index(name = "idx_article_status_created_at", columnList = "status, created_at"),
                @Index(name = "idx_article_featured_status_updated_at", columnList = "is_featured, status, updated_at"),
                @Index(name = "idx_article_bestseller_status_updated_at", columnList = "is_best_seller, status, updated_at"),
                @Index(name = "idx_article_flashsale_status_ends_at", columnList = "is_flash_sale, status, flash_sale_ends_at"),
                @Index(name = "idx_article_reference_partner", columnList = "reference_partner")
        }
)
public class Article extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(unique = true)
    private String ean;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String img;

    private String brand;

    @Column(nullable = false)
    private Double price;

    private Float vat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.ACTIVE;

    /**
     * ID du Partner qui a créé cet article (pour vérification d'ownership)
     */
    @Column(name = "reference_partner")
    private String referencePartner;

    /**
     * Remise en pourcentage (ex: 15 pour 15%)
     */
    private Float discountPercent;

    /**
     * Vente flash
     */
    @Builder.Default
    private Boolean isFlashSale = false;

    /**
     * Date fin vente flash
     */
    private LocalDateTime flashSaleEndsAt;

    /**
     * Sélection "lid choice"
     */
    @Builder.Default
    private Boolean isFeatured = false;

    /**
     * Meilleure vente
     */
    @Builder.Default
    private Boolean isBestSeller = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "article_categories",
            joinColumns = @JoinColumn(name = "article_id"),
            inverseJoinColumns = @JoinColumn(name = "categories_id"),
            indexes = {
                    @Index(name = "idx_article_categories_article", columnList = "article_id"),
                    @Index(name = "idx_article_categories_category", columnList = "categories_id")
            }
    )
    private List<Category> categories;

}
