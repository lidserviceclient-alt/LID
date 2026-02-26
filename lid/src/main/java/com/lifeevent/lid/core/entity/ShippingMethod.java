package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_method")
@Getter
@Setter
public class ShippingMethod extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "app_config_id", nullable = false)
    private AppConfig appConfig;

    @Column(name = "code", nullable = false, length = 60)
    private String code;

    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cost_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal costAmount;

    @Column(name = "enabled")
    private Boolean enabled = Boolean.TRUE;

    @Column(name = "is_default")
    private Boolean isDefault = Boolean.FALSE;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (enabled == null) enabled = Boolean.TRUE;
        if (isDefault == null) isDefault = Boolean.FALSE;
        if (sortOrder == null) sortOrder = 0;
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }
}

