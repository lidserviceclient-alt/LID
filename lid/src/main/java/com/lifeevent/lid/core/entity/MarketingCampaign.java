package com.lifeevent.lid.core.entity;

import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_campaign")
@Getter
@Setter
public class MarketingCampaign extends UuidEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private MarketingCampaignType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MarketingCampaignStatus status;

    @Column(name = "sent_count", nullable = false)
    private Long sentCount = 0L;

    @Column(name = "open_rate", precision = 5, scale = 2)
    private BigDecimal openRate;

    @Column(name = "click_rate", precision = 5, scale = 2)
    private BigDecimal clickRate;

    @Column(name = "revenue", precision = 12, scale = 2)
    private BigDecimal revenue;

    @Column(name = "budget_spent", precision = 12, scale = 2)
    private BigDecimal budgetSpent;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (sentCount == null) {
            sentCount = 0L;
        }
    }
}

