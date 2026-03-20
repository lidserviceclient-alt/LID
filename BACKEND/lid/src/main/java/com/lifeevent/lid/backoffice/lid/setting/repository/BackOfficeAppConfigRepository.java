package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeAppConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackOfficeAppConfigRepository extends JpaRepository<BackOfficeAppConfigEntity, Long> {
    Optional<BackOfficeAppConfigEntity> findTopByOrderByIdAsc();
}
