package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.FreeShippingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FreeShippingRuleRepository extends JpaRepository<FreeShippingRule, String> {
    List<FreeShippingRule> findByAppConfigIdOrderByUpdatedAtDesc(String appConfigId);
    Optional<FreeShippingRule> findFirstByAppConfigIdAndEnabledTrueOrderByUpdatedAtDesc(String appConfigId);
}

