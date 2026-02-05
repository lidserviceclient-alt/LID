package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MarketingCampaignDto(
        String id,
        String name,
        MarketingCampaignType type,
        MarketingCampaignStatus status,
        long sent,
        BigDecimal openRate,
        BigDecimal clickRate,
        BigDecimal revenue,
        BigDecimal budgetSpent,
        LocalDateTime dateCreation
) {
}

