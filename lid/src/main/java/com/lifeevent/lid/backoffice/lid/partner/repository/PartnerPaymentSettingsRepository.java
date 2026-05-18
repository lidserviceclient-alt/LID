package com.lifeevent.lid.backoffice.lid.partner.repository;

import com.lifeevent.lid.backoffice.lid.partner.entity.PartnerPaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerPaymentSettingsRepository extends JpaRepository<PartnerPaymentSettings, Long> {
    Optional<PartnerPaymentSettings> findByPartnerId(String partnerId);

    List<PartnerPaymentSettings> findByPartnerIdIn(Collection<String> partnerIds);
}
