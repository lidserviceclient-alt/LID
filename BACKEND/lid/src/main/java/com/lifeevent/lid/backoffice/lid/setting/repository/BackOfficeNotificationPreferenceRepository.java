package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeNotificationPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackOfficeNotificationPreferenceRepository extends JpaRepository<BackOfficeNotificationPreferenceEntity, String> {
}
