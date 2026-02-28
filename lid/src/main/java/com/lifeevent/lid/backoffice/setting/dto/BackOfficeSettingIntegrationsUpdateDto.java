package com.lifeevent.lid.backoffice.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingIntegrationsUpdateDto {
    private String paydunyaMode;
    private String paydunyaPublicKey;
    private String paydunyaPrivateKey;
    private String paydunyaMasterKey;
    private String paydunyaToken;
    private Boolean paydunyaDisconnect;

    private String sendinblueApiKey;
    private Boolean sendinblueDisconnect;

    private String slackWebhookUrl;
    private Boolean slackDisconnect;

    private String googleAnalyticsMeasurementId;
    private Boolean googleAnalyticsDisconnect;
}
