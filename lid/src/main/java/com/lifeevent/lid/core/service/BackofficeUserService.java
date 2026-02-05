package com.lifeevent.lid.core.service;

import com.lifeevent.lid.auth.repository.PasswordResetTokenRepository;
import com.lifeevent.lid.auth.repository.RefreshTokenRepository;
import com.lifeevent.lid.core.dto.BackofficeUserAuthDto;
import com.lifeevent.lid.core.dto.BackofficeUserDto;
import com.lifeevent.lid.core.dto.CreateBackofficeUserRequest;
import com.lifeevent.lid.core.dto.UpdateBackofficeUserRequest;
import com.lifeevent.lid.core.entity.Authentification;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.FournisseurAuth;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.AuthentificationRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class BackofficeUserService {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthentificationRepository authentificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public BackofficeUserService(
            UtilisateurRepository utilisateurRepository,
            AuthentificationRepository authentificationRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.authentificationRepository = authentificationRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional(readOnly = true)
    public Page<BackofficeUserDto> list(RoleUtilisateur role, String q, Pageable pageable) {
        String normalizedQ = q == null ? null : q.trim();
        if (normalizedQ != null && normalizedQ.isBlank()) normalizedQ = null;
        return utilisateurRepository.search(role, normalizedQ, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BackofficeUserDto getById(String id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur non trouvé"));
        return toDto(u);
    }

    @Transactional
    public BackofficeUserDto create(CreateBackofficeUserRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Email deja utilise");
        }

        Utilisateur u = new Utilisateur();
        u.setAvatarUrl(request.avatarUrl());
        u.setNom(request.nom());
        u.setPrenom(request.prenom());
        u.setEmail(email);
        u.setEmailVerifie(request.emailVerifie() != null ? request.emailVerifie() : Boolean.FALSE);
        u.setRole(request.role());
        u.setTelephone(request.telephone());
        u.setVille(request.ville());
        u.setPays(request.pays());

        Utilisateur saved = utilisateurRepository.save(u);
        return toDto(saved);
    }

    @Transactional
    public BackofficeUserDto update(String id, UpdateBackofficeUserRequest request) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur non trouvé"));

        String previousEmail = u.getEmail();
        if (request.email() != null) {
            String email = request.email().trim().toLowerCase(Locale.ROOT);
            if (!email.equals(previousEmail)) {
                utilisateurRepository.findByEmail(email).ifPresent((existing) -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(CONFLICT, "Email deja utilise");
                    }
                });
                u.setEmail(email);
                updateLocalAuthIdentifier(u, previousEmail, email);
            }
        }

        if (request.avatarUrl() != null) u.setAvatarUrl(request.avatarUrl());
        if (request.nom() != null) u.setNom(request.nom());
        if (request.prenom() != null) u.setPrenom(request.prenom());
        if (request.emailVerifie() != null) u.setEmailVerifie(request.emailVerifie());
        if (request.role() != null) u.setRole(request.role());
        if (request.telephone() != null) u.setTelephone(request.telephone());
        if (request.ville() != null) u.setVille(request.ville());
        if (request.pays() != null) u.setPays(request.pays());

        Utilisateur saved = utilisateurRepository.save(u);
        return toDto(saved);
    }

    @Transactional
    public void delete(String id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur non trouvé"));

        passwordResetTokenRepository.deleteAllByUtilisateur(u);
        refreshTokenRepository.deleteAllByUserId(id);
        authentificationRepository.deleteAllByUtilisateur(u);

        if (u.getRole() != RoleUtilisateur.SUPPRIME) {
            u.setRole(RoleUtilisateur.SUPPRIME);
        }
        u.setEmailVerifie(false);
        String fallbackEmail = buildDeletedEmail(u.getEmail(), id);
        u.setEmail(fallbackEmail);
        utilisateurRepository.save(u);
    }

    private void updateLocalAuthIdentifier(Utilisateur utilisateur, String oldEmail, String newEmail) {
        List<Authentification> auths = authentificationRepository.findAllByUtilisateur(utilisateur);
        boolean changed = false;
        for (Authentification auth : auths) {
            if (auth.getFournisseur() == FournisseurAuth.LOCAL) {
                if (auth.getIdentifiantFournisseur() != null && auth.getIdentifiantFournisseur().equalsIgnoreCase(oldEmail)) {
                    auth.setIdentifiantFournisseur(newEmail);
                    changed = true;
                }
            }
        }
        if (changed) {
            authentificationRepository.saveAll(auths);
        }
    }

    private BackofficeUserDto toDto(Utilisateur u) {
        List<BackofficeUserAuthDto> auths = authentificationRepository.findAllByUtilisateur(u).stream()
                .sorted(Comparator.comparing((Authentification a) -> a.getDateCreation() == null ? u.getDateCreation() : a.getDateCreation(),
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map((a) -> new BackofficeUserAuthDto(a.getFournisseur(), a.getIdentifiantFournisseur(), a.getDateCreation()))
                .toList();

        return new BackofficeUserDto(
                u.getId(),
                u.getAvatarUrl(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getEmailVerifie(),
                u.getRole(),
                u.getTelephone(),
                u.getVille(),
                u.getPays(),
                u.getDateCreation(),
                u.getDateMiseAJour(),
                auths
        );
    }

    private static String buildDeletedEmail(String previousEmail, String userId) {
        String clean = previousEmail == null ? "user" : previousEmail.trim().toLowerCase(Locale.ROOT);
        String suffix = userId != null ? userId : UUID.randomUUID().toString();
        String localPart = clean.contains("@") ? clean.substring(0, clean.indexOf('@')) : clean;
        int deletedIdx = localPart.indexOf(".deleted.");
        if (deletedIdx >= 0) {
            localPart = localPart.substring(0, deletedIdx);
        }
        if (localPart.isBlank()) localPart = "user";
        String compactSuffix = suffix.replace("-", "");
        if (compactSuffix.length() > 12) compactSuffix = compactSuffix.substring(0, 12);
        return String.format("%s.deleted.%s@lid.local", localPart, compactSuffix);
    }
}
