package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.CibleCodePromo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_promo")
@Getter
@Setter
public class CodePromo extends UuidEntity {

    @Column(name = "code", nullable = false, length = 12)
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "pourcentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal pourcentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "cible")
    private CibleCodePromo cible = CibleCodePromo.GLOBAL;

    @ManyToOne
    @JoinColumn(name = "boutique_id")
    private Boutique boutique;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "montant_min_commande", precision = 10, scale = 2)
    private BigDecimal montantMinCommande;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "usage_max")
    private Integer usageMax;

    @Column(name = "usage_max_par_utilisateur")
    private Integer usageMaxParUtilisateur = 1;

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}

