package com.lifeevent.lid.backoffice.setting.repository;

import com.lifeevent.lid.backoffice.setting.entity.BackOfficeSecuritySettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackOfficeSecuritySettingRepository extends JpaRepository<BackOfficeSecuritySettingEntity, Long> {
    Optional<BackOfficeSecuritySettingEntity> findTopByOrderByIdAsc();
}
