package com.lifeevent.lid.core.dto;

public record UpdateIntegrationsConfigRequest(
        Boolean paydunyaDisconnect,
        String paydunyaMode,
        String paydunyaPublicKey,
        String paydunyaPrivateKey,
        String paydunyaMasterKey,
        String paydunyaToken,

        Boolean sendinblueDisconnect,
        String sendinblueApiKey,

        Boolean slackDisconnect,
        String slackWebhookUrl,

        Boolean googleAnalyticsDisconnect,
        String googleAnalyticsMeasurementId
) {
}

