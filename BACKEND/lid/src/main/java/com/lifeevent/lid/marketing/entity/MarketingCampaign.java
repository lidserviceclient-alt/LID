package com.lifeevent.lid.marketing.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.marketing.enumeration.MarketingAudience;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "marketing_campaign")
public class MarketingCampaign extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketingCampaignType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketingCampaignStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private MarketingAudience audience = MarketingAudience.NEWSLETTER;

    @Column(length = 200)
    private String subject;

    @Column(length = 10000)
    private String content;

    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;

    @Column(nullable = false)
    @Builder.Default
    private Long sentCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long targetCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long failedCount = 0L;

    private Double openRate;
    private Double clickRate;
    private Double revenue;
    private Double budgetSpent;

    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    private LocalDateTime nextRetryAt;

    @Column(length = 2000)
    private String lastError;

    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (sentCount == null) {
            sentCount = 0L;
        }
        if (targetCount == null) {
            targetCount = 0L;
        }
        if (failedCount == null) {
            failedCount = 0L;
        }
        if (attempts == null) {
            attempts = 0;
        }
        if (audience == null) {
            audience = MarketingAudience.NEWSLETTER;
        }
    }
}
