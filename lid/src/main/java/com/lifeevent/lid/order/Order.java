package com.lifeevent.lid.order;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.List;

import java.time.LocalDateTime;

//@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Order extends BaseEntity {

    private LocalDateTime deliveryDate;

    private Integer amount;

    @ManyToMany
    private List<Article> articles;

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
