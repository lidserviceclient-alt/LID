package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.FournisseurAuth;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "authentification")
@Getter
@Setter
public class Authentification extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "fournisseur", nullable = false)
    private FournisseurAuth fournisseur;

    @Column(name = "identifiant_fournisseur", nullable = false)
    private String identifiantFournisseur;

    @Column(name = "mot_de_passe_hash")
    private String motDePasseHash;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}
