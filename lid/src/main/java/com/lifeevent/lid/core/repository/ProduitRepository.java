package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.entity.Categorie;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.enums.StatutProduit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProduitRepository extends JpaRepository<Produit, String> {
    Page<Produit> findByBoutique(Boutique boutique, Pageable pageable);
    Page<Produit> findByCategorie(Categorie categorie, Pageable pageable);
    Page<Produit> findByStatutNot(StatutProduit statut, Pageable pageable);
    long countByStatut(StatutProduit statut);
    Optional<Produit> findByReferencePartenaireIgnoreCase(String referencePartenaire);
}
