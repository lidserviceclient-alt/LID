package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.StatutLivraison;
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
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "livraison")
@Getter
@Setter
public class Livraison extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @Column(name = "transporteur", length = 100)
    private String transporteur;

    @Column(name = "numero_suivi")
    private String numeroSuivi;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutLivraison statut;

    @Column(name = "date_livraison_estimee")
    private LocalDate dateLivraisonEstimee;

    @Column(name = "cout_livraison", precision = 12, scale = 2)
    private BigDecimal coutLivraison;

    @Column(name = "date_livraison")
    private LocalDateTime dateLivraison;
}
