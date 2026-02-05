package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, String> {
    Optional<LoyaltyConfig> findTopByOrderByDateCreationDesc();
}

