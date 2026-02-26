package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.LoyaltyPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransaction, String> {
    boolean existsByCommandeId(String commandeId);
    Page<LoyaltyPointTransaction> findByUtilisateurIdOrderByDateCreationDesc(String utilisateurId, Pageable pageable);
}
