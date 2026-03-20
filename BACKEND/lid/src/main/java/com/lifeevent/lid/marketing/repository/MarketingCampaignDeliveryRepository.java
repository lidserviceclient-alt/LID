package com.lifeevent.lid.marketing.repository;

import com.lifeevent.lid.marketing.entity.MarketingCampaignDelivery;
import com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketingCampaignDeliveryRepository extends JpaRepository<MarketingCampaignDelivery, Long> {

    boolean existsByCampaign_Id(Long campaignId);

    long countByCampaign_Id(Long campaignId);

    long countByCampaign_IdAndStatus(Long campaignId, MarketingDeliveryStatus status);

    @Query("""
            select d from MarketingCampaignDelivery d
            where d.campaign.id = :campaignId
              and (
                d.status = com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus.PENDING
                or (
                  d.status = com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus.FAILED
                  and (d.nextRetryAt is null or d.nextRetryAt <= :now)
                )
              )
            order by d.createdAt asc
            """)
    List<MarketingCampaignDelivery> findDueBatch(@Param("campaignId") Long campaignId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("""
            select min(d.nextRetryAt) from MarketingCampaignDelivery d
            where d.campaign.id = :campaignId
              and d.status = com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus.FAILED
            """)
    LocalDateTime findEarliestRetryAt(@Param("campaignId") Long campaignId);

    void deleteByCampaign_Id(Long campaignId);
}
