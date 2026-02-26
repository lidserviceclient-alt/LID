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
@Table(name = "free_shipping_rule")
@Getter
@Setter
public class FreeShippingRule extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "app_config_id", nullable = false)
    private AppConfig appConfig;

    @Column(name = "enabled")
    private Boolean enabled = Boolean.FALSE;

    @Column(name = "threshold_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal thresholdAmount;

    @Column(name = "progress_message_template", columnDefinition = "TEXT")
    private String progressMessageTemplate;

    @Column(name = "unlocked_message", columnDefinition = "TEXT")
    private String unlockedMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (enabled == null) enabled = Boolean.FALSE;
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }
}

