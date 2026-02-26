package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.PasswordResetToken;
import com.lifeevent.lid.auth.enums.OneTimeCodePurpose;
import com.lifeevent.lid.core.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByCode(String code);
    Optional<PasswordResetToken> findByCodeAndPurpose(String code, OneTimeCodePurpose purpose);
    Optional<PasswordResetToken> findByUtilisateurAndUsedFalse(Utilisateur utilisateur);
    Optional<PasswordResetToken> findByUtilisateurAndPurposeAndUsedFalse(Utilisateur utilisateur, OneTimeCodePurpose purpose);
    long deleteAllByUtilisateur(Utilisateur utilisateur);
}
