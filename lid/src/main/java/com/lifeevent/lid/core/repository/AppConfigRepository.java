package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppConfigRepository extends JpaRepository<AppConfig, String> {
}
