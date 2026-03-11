package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeIntegrationSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackOfficeIntegrationSettingRepository extends JpaRepository<BackOfficeIntegrationSettingEntity, Long> {
    Optional<BackOfficeIntegrationSettingEntity> findTopByOrderByIdAsc();
}
