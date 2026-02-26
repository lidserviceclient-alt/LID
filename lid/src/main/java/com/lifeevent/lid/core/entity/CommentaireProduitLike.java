package com.lifeevent.lid.core.entity;

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
@Table(name = "commentaire_produit_like", uniqueConstraints = {
        @UniqueConstraint(name = "uk_commentaire_like_user", columnNames = {"commentaire_id", "utilisateur_id"})
})
@Getter
@Setter
public class CommentaireProduitLike extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "commentaire_id", nullable = false)
    private CommentaireProduit commentaire;

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
}

