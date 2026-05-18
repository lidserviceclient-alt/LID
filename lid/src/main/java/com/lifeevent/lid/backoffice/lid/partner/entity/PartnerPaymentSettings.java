package com.lifeevent.lid.backoffice.lid.partner.entity;

import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "partner_payment_settings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_partner_payment_settings_partner", columnNames = "partner_id")
        },
        indexes = {
                @Index(name = "idx_partner_payment_settings_partner", columnList = "partner_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class PartnerPaymentSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partner_id", nullable = false, length = 128)
    private String partnerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_mode", length = 64, nullable = false)
    private PartnerSettlementMode settlementMode;

    @Column(name = "margin_percent")
    private Double marginPercent;

    @Column(name = "payout_withdraw_mode", length = 64)
    private String payoutWithdrawMode;

    @Column(name = "payout_enabled", nullable = false)
    private Boolean payoutEnabled = Boolean.FALSE;
}
