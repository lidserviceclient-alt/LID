package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "loyalty_tier")
@Getter
@Setter
public class LoyaltyTier extends UuidEntity {

    @Column(name = "name", nullable = false, length = 30, unique = true)
    private String name;

    @Column(name = "min_points", nullable = false)
    private Integer minPoints;

    @Column(name = "benefits", length = 500)
    private String benefits;

    @Column(name = "rank_order", nullable = false)
    private Integer rankOrder;
}

