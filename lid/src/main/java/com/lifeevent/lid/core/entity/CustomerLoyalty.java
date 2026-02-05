package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_loyalty")
@Getter
@Setter
public class CustomerLoyalty extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @Column(name = "points", nullable = false)
    private Integer points = 0;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @PrePersist
    void onCreate() {
        if (points == null) points = 0;
        if (dateMiseAJour == null) dateMiseAJour = LocalDateTime.now();
    }
}

