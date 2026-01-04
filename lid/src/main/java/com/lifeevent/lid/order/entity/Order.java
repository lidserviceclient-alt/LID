package com.lifeevent.lid.order.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.order.enumeration.Status;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.List;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Order extends BaseEntity {

    private LocalDateTime deliveryDate;

    private Double amount;

    @OneToMany(mappedBy = "order")
    private List<OrderArticle> articles;

    @ManyToOne
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private Status currentStatus;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany
    private List<StatusHistory> history;
}
