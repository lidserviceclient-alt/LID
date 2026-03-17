package com.lifeevent.lid.auth.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;


@Entity
@Table(
        name = "refresh_token",
        indexes = {
                @Index(name = "idx_refresh_token_user_revoked_expires_at", columnList = "user_id, revoked, expires_at"),
                @Index(name = "idx_refresh_token_expires_at", columnList = "expires_at")
        }
)
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;
}
