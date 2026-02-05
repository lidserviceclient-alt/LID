package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_promo_utilisation")
@Getter
@Setter
public class CodePromoUtilisation extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "code_promo_id", nullable = false)
    private CodePromo codePromo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne
    @JoinColumn(name = "commande_id")
    private Commande commande;

    @Column(name = "montant_reduction", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantReduction;

    @Column(name = "date_utilisation")
    private LocalDateTime dateUtilisation;

    @PrePersist
    void onCreate() {
        if (dateUtilisation == null) {
            dateUtilisation = LocalDateTime.now();
        }
    }
}

