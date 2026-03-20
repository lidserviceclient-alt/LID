package com.lifeevent.lid.order.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.order.enumeration.Status;
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
        name = "status_history",
        indexes = {
                @Index(name = "idx_status_history_order_changed_at", columnList = "order_id, changed_at")
        }
)
public class StatusHistory extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    private Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    private String comment;
    
    @Column(nullable = false)
    private LocalDateTime changedAt;
}
