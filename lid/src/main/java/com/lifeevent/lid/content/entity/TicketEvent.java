package com.lifeevent.lid.content.entity;

import com.lifeevent.lid.core.entity.UuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_event")
@Getter
@Setter
public class TicketEvent extends UuidEntity {
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "available")
    private Boolean available = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @PrePersist
    void onCreate() {
        if (available == null) {
            available = true;
        }
    }
}
