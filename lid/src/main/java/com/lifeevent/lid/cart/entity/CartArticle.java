package com.lifeevent.lid.cart.entity;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.enumeration.CommerceItemType;
import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.ticket.entity.TicketEvent;
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
                @Index(name = "idx_cart_article_article", columnList = "article_id"),
                @Index(name = "idx_cart_article_ticket_event", columnList = "ticket_event_id")
        }
)
public class CartArticle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Cart cart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private CommerceItemType itemType = CommerceItemType.ARTICLE;

    @ManyToOne(fetch = FetchType.LAZY)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_event_id")
    private TicketEvent ticketEvent;

    /**
     * Quantité de cet article dans le panier
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Variante optionnelle choisie par l'utilisateur.
     */
    @Column(length = 64)
    private String color;

    /**
     * Taille optionnelle choisie par l'utilisateur.
     */
    @Column(length = 64)
    private String size;

    /**
     * Prix au moment de l'ajout au panier (pour tracer les changements de prix)
     */
    private Double priceAtAddedTime;
}
