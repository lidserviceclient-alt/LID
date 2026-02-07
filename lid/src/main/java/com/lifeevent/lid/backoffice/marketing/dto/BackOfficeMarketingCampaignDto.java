package com.lifeevent.lid.backoffice.marketing.dto;

import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeMarketingCampaignDto {
    private Long id;
    private String name;
    private MarketingCampaignType type;
    private MarketingCampaignStatus status;
    private Integer sent;
    private Double openRate;
    private Double clickRate;
    private Double revenue;
    private Double budgetSpent;
}
