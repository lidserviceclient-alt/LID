package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.BackofficeSecuritySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BackofficeSecuritySettingsRepository extends JpaRepository<BackofficeSecuritySettings, String> {
}
