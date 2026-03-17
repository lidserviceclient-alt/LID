package com.lifeevent.lid.loyalty.repository;

import com.lifeevent.lid.loyalty.entity.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, Long> {
    Optional<LoyaltyConfig> findTopByOrderByIdAsc();
}
