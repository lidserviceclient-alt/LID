package com.lifeevent.lid.user.customer.entity;

import com.lifeevent.lid.user.common.entity.UserEntity;
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
@DiscriminatorValue("CUSTOMER")
@PrimaryKeyJoinColumn(name = "user_id")
public class Customer extends UserEntity {
    private String avatarUrl;
    @Column(length = 30)
    private String phoneNumber;
    @Column(length = 100)
    private String city;
    @Column(length = 100)
    private String country;
}
