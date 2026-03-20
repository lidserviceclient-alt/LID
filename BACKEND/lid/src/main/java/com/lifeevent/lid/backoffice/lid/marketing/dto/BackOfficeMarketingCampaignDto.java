package com.lifeevent.lid.backoffice.lid.marketing.dto;

import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import com.lifeevent.lid.marketing.enumeration.MarketingAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeMarketingCampaignDto {
    private Long id;
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
    private LocalDateTime sentAt;
    private Long targetCount;
    private Long sent;
    private Long failed;
    private Double openRate;
    private Double clickRate;
    private Double revenue;
    private Double budgetSpent;
    private LocalDateTime createdAt;
    private String lastError;
}
