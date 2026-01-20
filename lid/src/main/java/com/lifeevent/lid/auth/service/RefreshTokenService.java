package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.entity.RefreshToken;
import com.lifeevent.lid.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    @Value("${config.security.app.refresh-ttl-days}")
    private long refreshTtlDays;

    public RefreshToken create(String userId){
        Instant exp = Instant.now().plus(refreshTtlDays, ChronoUnit.DAYS);
        var token = RefreshToken.builder()
                .userId(userId)
                .expiresAt(exp)
                .revoked(false)
                .build();
        return refreshTokenRepository.save(token);
    }

    public RefreshToken validate(UUID tokenId){
        return refreshTokenRepository
                .findByIdAndRevokedFalseAndExpiresAtAfter(tokenId, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
    }

    public void revoke(UUID tokenId){
        refreshTokenRepository.findById(tokenId).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }
}
