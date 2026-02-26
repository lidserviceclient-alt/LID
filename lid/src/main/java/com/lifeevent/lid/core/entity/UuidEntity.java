package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;

import java.util.UUID;

@MappedSuperclass
public abstract class UuidEntity {
    @Id
    @Column(length = 36, columnDefinition = "CHAR(36)")
    private String id;

    @PrePersist
    protected void onCreateId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
