package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.PasswordResetToken;
import com.lifeevent.lid.core.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByCode(String code);
    Optional<PasswordResetToken> findByUtilisateurAndUsedFalse(Utilisateur utilisateur);
    long deleteAllByUtilisateur(Utilisateur utilisateur);
}
