package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.SocialPlatform;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_social_link")
@Getter
@Setter
public class AppSocialLink extends UuidEntity {

    @ManyToOne
    @JoinColumn(name = "app_config_id", nullable = false)
    private AppConfig appConfig;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    private SocialPlatform platform;

    @Column(name = "url", nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (sortOrder == null) sortOrder = 0;
    }
}

