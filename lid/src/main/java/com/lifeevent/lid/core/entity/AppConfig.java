package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.lifeevent.lid.core.enums.ActivitySector;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_config")
@Getter
@Setter
public class AppConfig extends UuidEntity {

    @Column(name = "store_name")
    private String storeName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "city")
    private String city;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "slogan")
    private String slogan;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_sector")
    private ActivitySector activitySector;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
