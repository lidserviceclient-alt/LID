package com.lifeevent.lid.user.deliverydriver.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.user.common.entity.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "delivery_driver_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DelivryDriverProfileEntity extends BaseEntity {

    @Id
    @Column(name = "user_id", length = 128)
    private String userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(length = 30)
    private String phoneNumber;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @PrePersist
    @PreUpdate
    private void syncSharedPrimaryKey() {
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new IllegalStateException("Delivery profile.user must reference a managed UserEntity with non-null userId");
        }
        this.userId = user.getUserId();
    }
}
