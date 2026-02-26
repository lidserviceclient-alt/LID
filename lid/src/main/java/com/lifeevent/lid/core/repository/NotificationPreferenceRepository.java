package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, String> {
}

