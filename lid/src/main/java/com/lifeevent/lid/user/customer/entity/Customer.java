package com.lifeevent.lid.user.customer.entity;

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
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "customer_profile")
@Getter
@Setter
@ToString(callSuper = true, exclude = "user")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseEntity {

    @Id
    @Column(name = "user_id", length = 128)
    private String userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(length = 1000)
    private String avatarUrl;

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
            throw new IllegalStateException("Customer.user must reference a managed UserEntity with non-null userId");
        }
        this.userId = user.getUserId();
    }

    public String getEmail() {
        return user == null ? null : user.getEmail();
    }

    public void setEmail(String email) {
        requireUser().setEmail(email);
    }

    public String getFirstName() {
        return user == null ? null : user.getFirstName();
    }

    public void setFirstName(String firstName) {
        requireUser().setFirstName(firstName);
    }

    public String getLastName() {
        return user == null ? null : user.getLastName();
    }

    public void setLastName(String lastName) {
        requireUser().setLastName(lastName);
    }

    public boolean isEmailVerified() {
        return user != null && user.isEmailVerified();
    }

    public void setEmailVerified(boolean emailVerified) {
        requireUser().setEmailVerified(emailVerified);
    }

    public Boolean getBlocked() {
        return user == null ? Boolean.FALSE : user.getBlocked();
    }

    public void setBlocked(Boolean blocked) {
        requireUser().setBlocked(blocked);
    }

    private UserEntity requireUser() {
        if (user == null) {
            throw new IllegalStateException("Customer.user must be set before updating shared user fields");
        }
        return user;
    }
}
