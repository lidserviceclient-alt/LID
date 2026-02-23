package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;
import com.lifeevent.lid.core.enums.MarketingAudience;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MarketingCampaignDto(
        String id,
        String name,
        MarketingCampaignType type,
        MarketingCampaignStatus status,
        MarketingAudience audience,
        String subject,
        String content,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        long targetCount,
        long sent,
        long failed,
        BigDecimal openRate,
        BigDecimal clickRate,
        BigDecimal revenue,
        BigDecimal budgetSpent,
        LocalDateTime dateCreation,
        String lastError
) {
}
