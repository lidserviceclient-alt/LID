package com.lifeevent.lid.logistics.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "shipment",
        indexes = {
                @Index(name = "idx_shipment_order_id", columnList = "order_id"),
                @Index(name = "idx_shipment_tracking_id", columnList = "tracking_id"),
                @Index(name = "idx_shipment_status_created_at", columnList = "status, created_at"),
                @Index(name = "idx_shipment_carrier_created_at", columnList = "carrier, created_at")
        }
)
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderId;

    private String carrier;

    private String trackingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    private LocalDateTime eta;

    private Double cost;

    private String courierReference;

    private String courierName;

    private String courierPhone;

    private String courierUser;

    private LocalDateTime scannedAt;

    private String deliveryCode;

    private LocalDateTime deliveryCodeGeneratedAt;

    @Column(length = 1000)
    private String deliveryIssueComment;

    @Column(length = 1000)
    private String customerFacingComment;

    private LocalDateTime deliveredAt;
}
