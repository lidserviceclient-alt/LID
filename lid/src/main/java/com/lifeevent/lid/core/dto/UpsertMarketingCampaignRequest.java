package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;
import com.lifeevent.lid.core.enums.MarketingAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertMarketingCampaignRequest {

    @NotBlank
    private String name;

    @NotNull
    private MarketingCampaignType type;

    @NotNull
    private MarketingCampaignStatus status;

    private MarketingAudience audience;

    private String subject;

    private String content;

    private LocalDateTime scheduledAt;

    private Long sent;
    private BigDecimal openRate;
    private BigDecimal clickRate;
    private BigDecimal revenue;
    private BigDecimal budgetSpent;
}
