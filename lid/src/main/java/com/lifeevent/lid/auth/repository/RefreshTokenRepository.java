package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByIdAndRevokedFalseAndExpiresAtAfter(UUID id, Instant now);

    Optional<RefreshToken> findByUserIdAndRevokedFalseAndExpiresAtAfter(
            String userId,
            Instant now
    );
}
