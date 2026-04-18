package com.lifeevent.lid.order.entity;

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
        name = "order_article",
        indexes = {
                @Index(name = "idx_order_article_order", columnList = "order_id"),
                @Index(name = "idx_order_article_article", columnList = "article_id"),
                @Index(name = "idx_order_article_ticket_event", columnList = "ticket_event_id")
        }
)
public class OrderArticle extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private CommerceItemType itemType = CommerceItemType.ARTICLE;

    @ManyToOne(fetch = FetchType.LAZY)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_event_id")
    private TicketEvent ticketEvent;

    private Integer quantity;

    private Double priceAtOrder;
}
