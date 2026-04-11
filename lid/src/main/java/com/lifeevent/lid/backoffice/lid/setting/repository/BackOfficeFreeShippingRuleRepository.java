package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeFreeShippingRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BackOfficeFreeShippingRuleRepository extends JpaRepository<BackOfficeFreeShippingRuleEntity, String> {
    List<BackOfficeFreeShippingRuleEntity> findAllByOrderByCreatedAtDesc();
    Optional<BackOfficeFreeShippingRuleEntity> findFirstByEnabledTrueOrderByCreatedAtDesc();
}
