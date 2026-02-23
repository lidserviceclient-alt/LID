package com.lifeevent.lid.wishlist.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
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
@Table(name = "wishlist_product", uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "product_id"}))
public class Wishlist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", length = 128, nullable = false)
    private String customerId;

    @Column(name = "product_id", length = 36, nullable = false)
    private String productId;
}
