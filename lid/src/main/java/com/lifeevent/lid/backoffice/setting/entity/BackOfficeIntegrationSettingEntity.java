package com.lifeevent.lid.backoffice.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "backoffice_integration_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeIntegrationSettingEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean paydunyaConnected;
    private String paydunyaMode;
    private String paydunyaPublicKey;
    @Column(length = 4000)
    private String paydunyaPrivateKey;
    @Column(length = 4000)
    private String paydunyaMasterKey;
    @Column(length = 4000)
    private String paydunyaToken;

    private Boolean sendinblueConnected;
    @Column(length = 4000)
    private String sendinblueApiKey;

    private Boolean slackConnected;
    @Column(length = 4000)
    private String slackWebhookUrl;

    private Boolean googleAnalyticsConnected;
    private String googleAnalyticsMeasurementId;
}
