package com.lifeevent.lid.cart.entity;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart extends BaseEntity {
    @ManyToOne
    private Customer customer;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToMany
    private List<Article> articles;
}
