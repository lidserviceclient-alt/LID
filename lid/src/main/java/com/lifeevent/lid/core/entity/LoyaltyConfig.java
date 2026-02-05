package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_config")
@Getter
@Setter
public class LoyaltyConfig extends UuidEntity {

    @Column(name = "points_per_fcfa", nullable = false, precision = 10, scale = 6)
    private BigDecimal pointsPerFcfa;

    @Column(name = "value_per_point_fcfa", nullable = false, precision = 10, scale = 4)
    private BigDecimal valuePerPointFcfa;

    @Column(name = "retention_days", nullable = false)
    private Integer retentionDays;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}

