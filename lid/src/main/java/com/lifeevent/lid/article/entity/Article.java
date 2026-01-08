package com.lifeevent.lid.article.entity;

import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = "referenceProduitPartenaire"))
public class Article extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String referenceProduitPartenaire;

    @Column(unique = true)
    private String ean;

    @Column(nullable = false)
    private String name;

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
    private List<Category> categories;

}
