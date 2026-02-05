package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.Livraison;
import com.lifeevent.lid.core.enums.StatutLivraison;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LivraisonRepository extends JpaRepository<Livraison, String> {
    Optional<Livraison> findByCommande(Commande commande);

    @Query("""
            select l from Livraison l
            join l.commande c
            where (:status is null or l.statut = :status)
              and (:carrier is null or :carrier = '' or lower(l.transporteur) like lower(concat('%', :carrier, '%')))
              and (
                    :q is null or :q = ''
                    or lower(l.numeroSuivi) like lower(concat('%', :q, '%'))
                    or lower(c.id) like lower(concat('%', :q, '%'))
              )
            """)
    Page<Livraison> search(@Param("status") StatutLivraison status,
                           @Param("carrier") String carrier,
                           @Param("q") String q,
                           Pageable pageable);

    long countByStatut(StatutLivraison statut);

    @Query("""
            select coalesce(avg(l.coutLivraison), 0) from Livraison l
            join l.commande c
            where l.coutLivraison is not null
              and (:from is null or c.dateCreation >= :from)
            """)
    BigDecimal avgCostFrom(@Param("from") LocalDateTime from);

    List<Livraison> findByDateLivraisonAfter(LocalDateTime from);
}
