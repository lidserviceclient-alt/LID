package com.lifeevent.lid.newsletter.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Table(
        name = "newsletter_subscriber",
        indexes = {
                @Index(name = "idx_newsletter_status_created_at", columnList = "status, created_at")
        }
)
public class NewsletterSubscriber extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NewsletterSubscriberStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NewsletterSubscriberSource source;

    private LocalDateTime unsubscribedAt;

    @PrePersist
    void initId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
