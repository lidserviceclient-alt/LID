package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.StatutBoutique;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "boutique")
@Getter
@Setter
public class Boutique extends UuidEntity {

    @OneToOne
    @JoinColumn(name = "partenaire_id", nullable = false, unique = true)
    private Utilisateur partenaire;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "background_url", length = 512)
    private String backgroundUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutBoutique statut = StatutBoutique.INACTIVE;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}
