package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingIntegrationsDto {
    private Boolean paydunyaConnected;
    private String paydunyaMode;
    private String paydunyaPublicKey;
    private Boolean sendinblueConnected;
    private Boolean slackConnected;
    private Boolean googleAnalyticsConnected;
    private String googleAnalyticsMeasurementId;
}
