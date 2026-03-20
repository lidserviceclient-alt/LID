package com.lifeevent.lid.loyalty.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.user.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loyalty_point_adjustment")
public class LoyaltyPointAdjustment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Customer customer;

    @Column(nullable = false)
    private Integer deltaPoints;

    private String reason;
}
