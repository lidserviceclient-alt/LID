package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.NewsletterSubscriberSource;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "newsletter_subscriber",
        indexes = {
                @Index(name = "idx_newsletter_subscriber_email", columnList = "email", unique = true)
        }
)
@Getter
@Setter
public class NewsletterSubscriber extends UuidEntity {

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NewsletterSubscriberStatus status = NewsletterSubscriberStatus.SUBSCRIBED;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20)
    private NewsletterSubscriberSource source = NewsletterSubscriberSource.UNKNOWN;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @Column(name = "date_desabonnement")
    private LocalDateTime dateDesabonnement;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (dateCreation == null) {
            dateCreation = now;
        }
        if (dateMiseAJour == null) {
            dateMiseAJour = now;
        }
        if (status == null) {
            status = NewsletterSubscriberStatus.SUBSCRIBED;
        }
        if (source == null) {
            source = NewsletterSubscriberSource.UNKNOWN;
        }
    }

    @PreUpdate
    void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}

