package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeShippingMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackOfficeShippingMethodRepository extends JpaRepository<BackOfficeShippingMethodEntity, String> {
    List<BackOfficeShippingMethodEntity> findAllByOrderBySortOrderAscCreatedAtAsc();
}
