package com.lifeevent.lid.cart.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.user.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "cart",
        indexes = {
                @Index(name = "idx_cart_customer_user_id", columnList = "customer_user_id")
        }
)
public class Cart extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    @OneToMany(mappedBy = "cart", fetch = FetchType.LAZY)
    private List<CartArticle> articles;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
}
