package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, String> {
}

