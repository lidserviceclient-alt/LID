package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Panier;
import com.lifeevent.lid.core.entity.PanierLigne;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PanierLigneRepository extends JpaRepository<PanierLigne, String> {
    List<PanierLigne> findByPanier(Panier panier);
}
