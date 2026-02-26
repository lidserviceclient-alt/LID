package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "commentaire_produit")
@Getter
@Setter
public class CommentaireProduit extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "commentaire", columnDefinition = "TEXT", nullable = false)
    private String commentaire;

    @Column(name = "note")
    private Integer note;

    @Column(name = "est_valide")
    private Boolean estValide = false;

    @Column(name = "like_count")
    private Long likeCount = 0L;

    @Column(name = "report_count")
    private Long reportCount = 0L;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (likeCount == null) likeCount = 0L;
        if (reportCount == null) reportCount = 0L;
    }

    @PreUpdate
    void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
