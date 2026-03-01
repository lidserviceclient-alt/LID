package com.lifeevent.lid.logistics.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "shipment")
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

    private LocalDate eta;

    private Double cost;

    private String courierReference;

    private String courierName;

    private String courierPhone;

    private String courierUser;

    private LocalDateTime scannedAt;

    private String deliveryCode;

    private LocalDateTime deliveryCodeGeneratedAt;

    private LocalDateTime deliveredAt;
}
