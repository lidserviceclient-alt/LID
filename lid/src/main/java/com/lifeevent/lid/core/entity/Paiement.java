package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.StatutPaiement;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiement")
@Getter
@Setter
public class Paiement extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "commande_id")
    private Commande commande;

    @Column(name = "fournisseur", length = 50)
    private String fournisseur;

    @Column(name = "montant", precision = 19, scale = 2)
    private BigDecimal montant;

    @Column(name = "devise", length = 3)
    private String devise;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutPaiement statut;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
}
