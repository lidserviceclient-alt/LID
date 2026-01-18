package com.lifeevent.lid.order.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.order.enumeration.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Customer customer;

    /**
     * Montant total de la commande (TTC)
     */
    @Column(nullable = false)
    private Double amount;

    /**
     * Statut courant de la commande
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status currentStatus;

    /**
     * Historique des changements de statut
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StatusHistory> statusHistory;

    /**
     * Lignes de commande
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderArticle> articles;

    /**
     * Date de livraison estimée/réelle
     */
    private LocalDateTime deliveryDate;

    /**
     * Numéro de suivi externe
     */
    private String trackingNumber;

    /**
     * Devise utilisée (ex: FCFA, EUR)
     */
    @Column(length = 3)
    private String currency;

}
