package com.lifeevent.lid.payment.partner.entity;

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
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "partner_settlement",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_partner_settlement_order_partner", columnNames = {"order_id", "partner_id"})
        },
        indexes = {
                @Index(name = "idx_partner_settlement_partner_status_tx_date", columnList = "partner_id, payout_status, transaction_date"),
                @Index(name = "idx_partner_settlement_eligible_status", columnList = "eligible_at, payout_status"),
                @Index(name = "idx_partner_settlement_order_partner", columnList = "order_id, partner_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class PartnerSettlement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "partner_id", nullable = false, length = 128)
    private String partnerId;

    @Column(name = "partner_name", length = 255)
    private String partnerName;

    @Column(length = 3, nullable = false)
    @Builder.Default
    private String currency = "XOF";

    @Column(name = "gross_amount", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal grossAmount = BigDecimal.ZERO;

    @Column(name = "discount_allocation", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal discountAllocation = BigDecimal.ZERO;

    @Column(name = "shipping_allocation", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal shippingAllocation = BigDecimal.ZERO;

    @Column(name = "return_cost_allocation", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal returnCostAllocation = BigDecimal.ZERO;

    @Column(name = "margin_percent", precision = 9, scale = 6, nullable = false)
    @Builder.Default
    private BigDecimal marginPercent = BigDecimal.ZERO;

    @Column(name = "margin_amount", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal marginAmount = BigDecimal.ZERO;

    @Column(name = "net_amount", precision = 19, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "eligible_at")
    private LocalDateTime eligibleAt;

    @Column(name = "paid_out_at")
    private LocalDateTime paidOutAt;

    @Column(name = "payout_reference", length = 128)
    private String payoutReference;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status", length = 32, nullable = false)
    @Builder.Default
    private PartnerSettlementStatus payoutStatus = PartnerSettlementStatus.PENDING_WINDOW;
}
