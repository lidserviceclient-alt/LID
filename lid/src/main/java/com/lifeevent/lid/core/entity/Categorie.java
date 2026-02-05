package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.NiveauCategorie;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "categorie")
@Getter
@Setter
public class Categorie extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Categorie parent;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau", nullable = false)
    private NiveauCategorie niveau;

    @Column(name = "ordre")
    private Integer ordre = 0;

    @Column(name = "est_active")
    private Boolean estActive = true;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (dateCreation == null) {
            dateCreation = now;
        }
        if (dateMiseAJour == null) {
            dateMiseAJour = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}
