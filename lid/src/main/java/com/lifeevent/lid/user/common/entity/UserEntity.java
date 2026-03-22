package com.lifeevent.lid.user.common.entity;

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
@Table(
        indexes = {
                @Index(name = "idx_user_email", columnList = "email")
        }
)
public class UserEntity extends BaseEntity {
    @Id
    @Column(length = 128)
    private String userId;
    
    private String lastName;
    private String firstName;
    
    @Column(nullable = false)
    private boolean emailVerified;
    
    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private Boolean blocked = Boolean.FALSE;
}
