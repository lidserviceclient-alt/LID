package com.lifeevent.lid.order.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.order.enumeration.ReturnRefundStatus;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "return_request",
        indexes = {
                @jakarta.persistence.Index(name = "idx_return_request_order_status_created_at", columnList = "order_id, status, created_at"),
                @jakarta.persistence.Index(name = "idx_return_request_refund_status_created_at", columnList = "refund_status, created_at")
        }
)
public class ReturnRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false, length = 64)
    private String orderNumber;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReturnRequestStatus status = ReturnRequestStatus.SUBMITTED;

    @OneToMany(mappedBy = "returnRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ReturnRequestItem> items = new ArrayList<>();

    @Column(precision = 19, scale = 2)
    private BigDecimal refundAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    @Builder.Default
    private ReturnRefundStatus refundStatus = ReturnRefundStatus.NOT_REQUESTED;

    @Column(length = 128)
    private String refundReference;
}
