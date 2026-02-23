package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.MarketingCampaignDelivery;
import com.lifeevent.lid.core.enums.MarketingDeliveryStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MarketingCampaignDeliveryRepository extends JpaRepository<MarketingCampaignDelivery, String> {

    boolean existsByCampaign_Id(String campaignId);

    long countByCampaign_Id(String campaignId);

    long countByCampaign_IdAndStatus(String campaignId, MarketingDeliveryStatus status);

    @Query("""
            select d from MarketingCampaignDelivery d
            where d.campaign.id = :campaignId
              and (
                d.status = com.lifeevent.lid.core.enums.MarketingDeliveryStatus.PENDING
                or (
                  d.status = com.lifeevent.lid.core.enums.MarketingDeliveryStatus.FAILED
                  and (d.nextRetryAt is null or d.nextRetryAt <= :now)
                )
              )
            order by d.createdAt asc
            """)
    List<MarketingCampaignDelivery> findDueBatch(@Param("campaignId") String campaignId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("""
            select d.recipient from MarketingCampaignDelivery d
            where d.campaign.id = :campaignId
            """)
    List<String> findRecipients(@Param("campaignId") String campaignId);

    @Query("""
            select min(d.nextRetryAt) from MarketingCampaignDelivery d
            where d.campaign.id = :campaignId
              and d.status = com.lifeevent.lid.core.enums.MarketingDeliveryStatus.FAILED
            """)
    LocalDateTime findEarliestRetryAt(@Param("campaignId") String campaignId);

    void deleteByCampaign_Id(String campaignId);
}
