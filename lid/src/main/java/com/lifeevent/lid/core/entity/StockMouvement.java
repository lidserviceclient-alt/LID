package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.TypeMouvementStock;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_mouvement")
@Getter
@Setter
public class StockMouvement extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(name = "sku", nullable = false, length = 128)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TypeMouvementStock type;

    @Column(name = "quantite", nullable = false)
    private Integer quantite;

    @Column(name = "stock_avant", nullable = false)
    private Integer stockAvant;

    @Column(name = "stock_apres", nullable = false)
    private Integer stockApres;

    @Column(name = "reference", length = 255)
    private String reference;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}
