package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.enums.StatutCommande;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface CommandeRepository extends JpaRepository<Commande, String> {
    Page<Commande> findByStatut(StatutCommande statut, Pageable pageable);
    List<Commande> findTop5ByOrderByDateCreationDesc();
    long countByStatut(StatutCommande statut);
    List<Commande> findByDateCreationAfter(LocalDateTime from);

    @Query("select coalesce(sum(c.montantTotal), 0) from Commande c")
    BigDecimal sumTotalRevenue();

    List<Commande> findByClientId(String clientId);

    @Query("""
            select c from Commande c
            join c.client u
            where (:status is null or c.statut = :status)
              and (
                    :q is null or :q = ''
                    or lower(c.id) like lower(concat('%', :q, '%'))
                    or lower(u.nom) like lower(concat('%', :q, '%'))
                    or lower(u.prenom) like lower(concat('%', :q, '%'))
                    or lower(u.email) like lower(concat('%', :q, '%'))
              )
            """)
    Page<Commande> search(@Param("status") StatutCommande status, @Param("q") String q, Pageable pageable);

    @Query(value = "select count(distinct client_id) from commande where date_creation >= :from", nativeQuery = true)
    long countDistinctClientsSince(@Param("from") LocalDateTime from);

    @Query(value = """
            select count(*) from (
              select client_id
              from commande
              where date_creation >= :from
              group by client_id
              having count(*) >= 2
            ) t
            """, nativeQuery = true)
    long countRepeatClientsSince(@Param("from") LocalDateTime from);
}
