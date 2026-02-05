package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Panier;
import com.lifeevent.lid.core.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PanierRepository extends JpaRepository<Panier, String> {
    Optional<Panier> findByClient(Utilisateur client);
}
