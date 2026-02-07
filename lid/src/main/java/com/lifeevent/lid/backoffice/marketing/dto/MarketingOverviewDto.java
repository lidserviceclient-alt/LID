package com.lifeevent.lid.backoffice.marketing.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingOverviewDto {
    private Double roiGlobal;
    private Double budgetSpent;
    private List<MarketingChannelShareDto> channels;
}
