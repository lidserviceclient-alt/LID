package com.lifeevent.lid.logistics.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.logistics.enumeration.ShipmentHistorySource;
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
        name = "shipment_status_history",
        indexes = {
                @Index(name = "idx_shipment_status_history_shipment_changed_at", columnList = "shipment_id, changed_at")
        }
)
public class ShipmentStatusHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ShipmentStatus status;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @Column(length = 1000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ShipmentHistorySource source;

    private String actorId;

    private String actorLabel;
}
