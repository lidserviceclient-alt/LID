package com.lifeevent.lid.auth.entity;

import com.lifeevent.lid.auth.constant.AuthenticationType;
import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(
        name = "authentication",
        indexes = {
                @Index(name = "idx_auth_type", columnList = "type")
        }
)
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
    @CollectionTable(
            name = "authentication_roles",
            joinColumns = @JoinColumn(name = "authentication_user_id"),
            indexes = {
                    @Index(name = "idx_auth_roles_role_user", columnList = "roles, authentication_user_id"),
                    @Index(name = "idx_auth_roles_user", columnList = "authentication_user_id")
            }
    )
    @Column(name = "roles")
    @Enumerated(EnumType.STRING)
    private List<UserRole> roles;

    @Enumerated(EnumType.STRING)
    private AuthenticationType type;

    @Column(length = 255)
    private String passwordHash;
}
