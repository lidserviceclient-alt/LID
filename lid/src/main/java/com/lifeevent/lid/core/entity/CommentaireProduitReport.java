package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "commentaire_produit_report", uniqueConstraints = {
        @UniqueConstraint(name = "uk_commentaire_report_user", columnNames = {"commentaire_id", "utilisateur_id"})
})
@Getter
@Setter
public class CommentaireProduitReport extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "commentaire_id", nullable = false)
    private CommentaireProduit commentaire;

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "reason", nullable = false, length = 50)
    private String reason;

    @Column(name = "details", length = 500)
    private String details;

    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
}

