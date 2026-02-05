package com.lifeevent.lid.stock.entity;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity(name = "ArticleStock")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "article_stock")
public class Stock extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Article concerné par ce stock
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    /**
     * Quantité réellement disponible à la vente
     */
    @Column(nullable = false)
    private Integer quantityAvailable;

    /**
     * Quantité réservée (commande en cours, paiement non confirmé)
     */
    @Column(nullable = false)
    private Integer quantityReserved;

    /**
     * Numéro de lot (traçabilité)
     */
    @Column(length = 255)
    private String lot;

    /**
     * Date de péremption / DLC
     */
    private LocalDate bestBefore;
}
