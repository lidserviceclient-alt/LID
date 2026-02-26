package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_point_tx", uniqueConstraints = {
        @UniqueConstraint(name = "uk_loyalty_tx_order", columnNames = {"commande_id"})
})
@Getter
@Setter
public class LoyaltyPointTransaction extends UuidEntity {

    public enum Type {
        ORDER,
        ADJUSTMENT
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(optional = true)
    @JoinColumn(name = "commande_id", nullable = true)
    private Commande commande;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
        if (type == null || type.isBlank()) type = Type.ORDER.name();
    }
}
