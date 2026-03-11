package com.lifeevent.lid.backoffice.lid.marketing.dto;

import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingChannelShareDto {
    private MarketingCampaignType channel;
    private Double sharePercent;
}
