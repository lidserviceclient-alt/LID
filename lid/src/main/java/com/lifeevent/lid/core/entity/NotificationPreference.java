package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preference")
@Getter
@Setter
public class NotificationPreference {

    @Id
    @Column(name = "preference_key", nullable = false, length = 80)
    private String key;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (enabled == null) enabled = true;
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }
}

