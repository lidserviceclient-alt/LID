package com.lifeevent.lid.backoffice.setting.repository;

import com.lifeevent.lid.backoffice.setting.entity.BackOfficeAppConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackOfficeAppConfigRepository extends JpaRepository<BackOfficeAppConfigEntity, Long> {
    Optional<BackOfficeAppConfigEntity> findTopByOrderByIdAsc();
}
