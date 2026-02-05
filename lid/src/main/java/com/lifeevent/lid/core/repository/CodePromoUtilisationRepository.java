package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CodePromoUtilisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface CodePromoUtilisationRepository extends JpaRepository<CodePromoUtilisation, String> {

    List<CodePromoUtilisation> findByDateUtilisationAfter(LocalDateTime from);

    long countByCodePromoId(String codePromoId);

    long countByCodePromoIdAndUtilisateurId(String codePromoId, String utilisateurId);

    interface PromoUsageAgg {
        String getPromoId();

        long getUsageCount();

        BigDecimal getTotalReduction();
    }

    @Query("""
            select u.codePromo.id as promoId,
                   count(u) as usageCount,
                   coalesce(sum(u.montantReduction), 0) as totalReduction
            from CodePromoUtilisation u
            group by u.codePromo.id
            """)
    List<PromoUsageAgg> aggregateUsageByPromoId();
}
