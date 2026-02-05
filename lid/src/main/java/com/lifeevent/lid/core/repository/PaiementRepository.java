package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.Paiement;
import com.lifeevent.lid.core.enums.StatutPaiement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, String> {
    List<Paiement> findByCommande(Commande commande);

    @Query("select p from Paiement p order by case when p.datePaiement is null then 1 else 0 end, p.datePaiement desc")
    Page<Paiement> findLatest(Pageable pageable);

    @Query("""
            select coalesce(sum(p.montant), 0)
            from Paiement p
            where p.statut = :statut
              and (:from is null or p.datePaiement >= :from)
            """)
    BigDecimal sumMontantByStatutSince(@Param("statut") StatutPaiement statut, @Param("from") LocalDateTime from);
}
