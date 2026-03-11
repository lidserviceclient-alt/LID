package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingFreeShippingRuleDto {
    private String id;
    private Double thresholdAmount;
    private String progressMessageTemplate;
    private String unlockedMessage;
    private Boolean enabled;
}
