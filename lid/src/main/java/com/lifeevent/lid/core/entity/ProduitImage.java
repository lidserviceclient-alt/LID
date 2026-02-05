package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "produit_image")
@Getter
@Setter
public class ProduitImage extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(name = "url", nullable = false, length = 512)
    private String url;

    @Column(name = "est_principale")
    private Boolean estPrincipale = false;
}
