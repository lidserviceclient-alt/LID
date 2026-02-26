package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "integration_config")
@Getter
@Setter
public class IntegrationConfig extends UuidEntity {

    @Column(name = "paydunya_mode")
    private String paydunyaMode;

    @Column(name = "paydunya_public_key")
    private String paydunyaPublicKey;

    @Column(name = "paydunya_private_key")
    private String paydunyaPrivateKey;

    @Column(name = "paydunya_master_key")
    private String paydunyaMasterKey;

    @Column(name = "paydunya_token")
    private String paydunyaToken;

    @Column(name = "sendinblue_api_key")
    private String sendinblueApiKey;

    @Column(name = "slack_webhook_url")
    private String slackWebhookUrl;

    @Column(name = "google_analytics_measurement_id")
    private String googleAnalyticsMeasurementId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}

