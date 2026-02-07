package com.lifeevent.lid.marketing.repository;

import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {
    Page<MarketingCampaign> findByStatus(MarketingCampaignStatus status, Pageable pageable);
}
