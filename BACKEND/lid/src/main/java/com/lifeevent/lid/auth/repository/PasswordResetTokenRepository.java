package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.PasswordResetToken;
import com.lifeevent.lid.auth.enums.OneTimeCodePurpose;
import com.lifeevent.lid.user.common.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByCodeAndPurpose(String code, OneTimeCodePurpose purpose);

    Optional<PasswordResetToken> findByUserAndPurposeAndUsedFalse(UserEntity user, OneTimeCodePurpose purpose);

    long deleteAllByUser(UserEntity user);
}
