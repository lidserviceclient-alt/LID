package com.lifeevent.lid.backoffice.partner.preference.repository;

import com.lifeevent.lid.backoffice.partner.preference.entity.PartnerPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerPreferencesRepository extends JpaRepository<PartnerPreferences, String> {
}

