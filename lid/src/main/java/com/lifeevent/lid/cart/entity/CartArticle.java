package com.lifeevent.lid.cart.entity;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cart_article")
public class CartArticle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    private Cart cart;

    @ManyToOne(optional = false)
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
