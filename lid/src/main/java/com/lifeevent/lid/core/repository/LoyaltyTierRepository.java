package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, String> {
    List<LoyaltyTier> findAllByOrderByRankOrderAscMinPointsAsc();

    Optional<LoyaltyTier> findByNameIgnoreCase(String name);
}

