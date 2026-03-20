package com.lifeevent.lid.marketing.entity;

import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode
@ToString
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
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
public class MarketingCampaignDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    @Builder.Default
    private MarketingDeliveryStatus status = MarketingDeliveryStatus.PENDING;

    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "last_error", length = 2000)
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
