package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CommandeLigne;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CommandeLigneRepository extends JpaRepository<CommandeLigne, String> {
    List<CommandeLigne> findByCommande(Commande commande);
    long countByCommandeId(String commandeId);
    List<CommandeLigne> findByCommandeDateCreationAfter(LocalDateTime from);
}
