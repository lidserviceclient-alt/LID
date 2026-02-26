package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.StatutProduit;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produit")
@Getter
@Setter
public class Produit extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "boutique_id", nullable = false)
    private Boutique boutique;

    @ManyToOne
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @Column(name = "reference_partenaire", nullable = false)
    private String referencePartenaire;

    @Column(name = "ean", unique = true)
    private String ean;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "marque")
    private String marque;

    @Column(name = "prix", nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(name = "tva", precision = 5, scale = 2)
    private BigDecimal tva;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutProduit statut = StatutProduit.ACTIF;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "mis_en_avant")
    private Boolean isFeatured = false;

    @Column(name = "meilleur_vente")
    private Boolean isBestSeller = false;

    @OneToOne(mappedBy = "produit", cascade = CascadeType.ALL)
    private Stock stock;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private List<ProduitImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private List<CommentaireProduit> commentaires = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (isFeatured == null) {
            isFeatured = false;
        }
        if (isBestSeller == null) {
            isBestSeller = false;
        }
    }
}
