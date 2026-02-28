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

    @Column(name = "livreur_reference", length = 150)
    private String livreurReference;

    @Column(name = "livreur_nom", length = 150)
    private String livreurNom;

    @Column(name = "livreur_telephone", length = 30)
    private String livreurTelephone;

    @Column(name = "livreur_utilisateur", length = 150)
    private String livreurUtilisateur;

    @Column(name = "date_scan_livreur")
    private LocalDateTime dateScanLivreur;

    @Column(name = "code_remise", length = 4)
    private String codeRemise;

    @Column(name = "date_code_remise")
    private LocalDateTime dateCodeRemise;

    @Column(name = "date_mail_expedition")
    private LocalDateTime dateMailExpedition;

    @Column(name = "adresse_livraison")
    private String adresseLivraison;

    @Column(name = "ville_livraison", length = 100)
    private String villeLivraison;

    @Column(name = "code_postal_livraison", length = 20)
    private String codePostalLivraison;

    @Column(name = "pays_livraison", length = 100)
    private String paysLivraison;

    @Column(name = "telephone_livraison", length = 30)
    private String telephoneLivraison;
}
