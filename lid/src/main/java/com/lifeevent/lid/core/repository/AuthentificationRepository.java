package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Authentification;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.FournisseurAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthentificationRepository extends JpaRepository<Authentification, String> {
    Optional<Authentification> findByFournisseurAndIdentifiantFournisseur(FournisseurAuth fournisseur, String identifiantFournisseur);
    Optional<Authentification> findByUtilisateurAndFournisseur(Utilisateur utilisateur, FournisseurAuth fournisseur);
    List<Authentification> findAllByUtilisateur(Utilisateur utilisateur);
    long deleteAllByUtilisateur(Utilisateur utilisateur);
}
