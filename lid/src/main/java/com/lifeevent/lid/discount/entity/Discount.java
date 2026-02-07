package com.lifeevent.lid.discount.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import com.lifeevent.lid.discount.enumeration.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "discount")
public class Discount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType type;

    /**
     * Valeur de la remise (pourcentage ou montant fixe)
     */
    @Column(nullable = false)
    private Double value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountTarget target;

    /**
     * Contrainte cible (id boutique ou utilisateur)
     */
    private String targetId;

    /**
     * Montant minimum de commande pour appliquer la remise
     */
    private Double minOrderAmount;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    @Builder.Default
    private Boolean isActive = true;

    /**
     * Limites d'usage
     */
    private Integer usageMax;
    private Integer usageMaxPerUser;

    @Builder.Default
    private Integer usageCount = 0;
}
