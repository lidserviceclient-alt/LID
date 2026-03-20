package com.lifeevent.lid.loyalty.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loyalty_config")
public class LoyaltyConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Points gagnés par FCFA dépensé
     */
    @Column(nullable = false)
    private Double pointsPerFcfa;

    /**
     * Valeur d'un point en FCFA
     */
    @Column(nullable = false)
    private Double valuePerPointFcfa;

    /**
     * Fenêtre de rétention (jours)
     */
    @Column(nullable = false)
    private Integer retentionDays;
}
