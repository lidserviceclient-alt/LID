package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, String> {
    List<ShippingMethod> findByAppConfigIdOrderBySortOrderAscUpdatedAtDesc(String appConfigId);
    Optional<ShippingMethod> findFirstByAppConfigIdAndEnabledTrueAndIsDefaultTrueOrderByUpdatedAtDesc(String appConfigId);
}

