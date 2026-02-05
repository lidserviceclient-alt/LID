package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.LoyaltyPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransaction, String> {
    boolean existsByCommandeId(String commandeId);
}

