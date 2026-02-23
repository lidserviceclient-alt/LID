package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.MarketingCampaignType;
import com.lifeevent.lid.core.enums.MarketingDeliveryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "marketing_campaign_delivery",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_marketing_delivery_campaign_recipient", columnNames = {"campaign_id", "recipient"})
        },
        indexes = {
                @Index(name = "idx_marketing_delivery_campaign_status", columnList = "campaign_id,status"),
                @Index(name = "idx_marketing_delivery_status_retry", columnList = "status,next_retry_at")
        }
)
@Getter
@Setter
public class MarketingCampaignDelivery extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private MarketingCampaign campaign;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private MarketingCampaignType channel;

    @Column(name = "recipient", nullable = false, length = 255)
    private String recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MarketingDeliveryStatus status = MarketingDeliveryStatus.PENDING;

    @Column(name = "attempts", nullable = false)
    private Integer attempts = 0;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (attempts == null) {
            attempts = 0;
        }
        if (status == null) {
            status = MarketingDeliveryStatus.PENDING;
        }
    }
}

