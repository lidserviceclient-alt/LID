package com.lifeevent.lid.loyalty.repository;

import com.lifeevent.lid.loyalty.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, Long> {
    Optional<LoyaltyTier> findByNameIgnoreCase(String name);
    List<LoyaltyTier> findAllByOrderByMinPointsAscNameAsc();
    Optional<LoyaltyTier> findTopByMinPointsLessThanEqualOrderByMinPointsDesc(Integer points);
}
