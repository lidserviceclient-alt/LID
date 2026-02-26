package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.entity.Categorie;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.enums.StatutProduit;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProduitRepository extends JpaRepository<Produit, String> {
    Page<Produit> findByBoutique(Boutique boutique, Pageable pageable);
    Page<Produit> findByCategorie(Categorie categorie, Pageable pageable);
    Page<Produit> findByStatutNot(StatutProduit statut, Pageable pageable);
    long countByStatut(StatutProduit statut);
    Optional<Produit> findByReferencePartenaireIgnoreCase(String referencePartenaire);
    Optional<Produit> findByEanIgnoreCase(String ean);

    Page<Produit> findByIsFeaturedTrueAndStatutNot(StatutProduit statut, Pageable pageable);

    List<Produit> findByIsFeaturedTrueAndStatutNot(StatutProduit statut, Sort sort);

    Page<Produit> findByIsBestSellerTrueAndStatutNot(StatutProduit statut, Pageable pageable);

    @Query("""
            select p
            from Produit p
            join p.categorie c
            where p.statut <> :archived
              and (:q is null
                   or lower(p.nom) like lower(concat('%', :q, '%'))
                   or lower(coalesce(p.marque, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(c.nom, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(c.slug, '')) like lower(concat('%', :q, '%')))
              and (:cats is null
                   or lower(c.slug) in :cats
                   or c.id in :cats)
            """)
    Page<Produit> searchCatalog(
            @Param("archived") StatutProduit archived,
            @Param("q") String q,
            @Param("cats") List<String> categoryTokensLowerOrIds,
            Pageable pageable
    );
}
