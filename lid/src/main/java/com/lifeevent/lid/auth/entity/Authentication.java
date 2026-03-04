package com.lifeevent.lid.auth.entity;

import com.lifeevent.lid.auth.constant.AuthenticationType;
import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "authentication")
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Authentication extends BaseEntity {
    @Id
    @Column(length = 128)
    private String userId;
    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<UserRole> roles;

    @Enumerated(EnumType.STRING)
    private AuthenticationType type;

    @Column(length = 255)
    private String passwordHash;
}
