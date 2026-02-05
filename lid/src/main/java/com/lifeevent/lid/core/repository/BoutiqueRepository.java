package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoutiqueRepository extends JpaRepository<Boutique, String> {
    Optional<Boutique> findByPartenaire(Utilisateur partenaire);
}
