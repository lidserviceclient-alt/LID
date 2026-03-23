package com.lifeevent.lid.cart.entity;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "cart_article",
        indexes = {
                @Index(name = "idx_cart_article_cart", columnList = "cart_id"),
                @Index(name = "idx_cart_article_article", columnList = "article_id")
        }
)
public class CartArticle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Article article;

    /**
     * Quantité de cet article dans le panier
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Prix au moment de l'ajout au panier (pour tracer les changements de prix)
     */
    private Double priceAtAddedTime;
}
