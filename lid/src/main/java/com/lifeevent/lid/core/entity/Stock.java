package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "stock")
@Getter
@Setter
public class Stock extends UuidEntity {

    @OneToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(name = "quantite_disponible", nullable = false)
    private Integer quantiteDisponible;

    @Column(name = "quantite_reservee")
    private Integer quantiteReservee = 0;

    @Column(name = "date_peremption")
    private LocalDate datePeremption;
}
