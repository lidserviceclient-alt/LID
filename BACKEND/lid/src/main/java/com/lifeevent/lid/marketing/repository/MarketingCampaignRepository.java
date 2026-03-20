package com.lifeevent.lid.marketing.repository;

import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {
    interface TypeRevenueAgg {
        MarketingCampaignType getType();
        Double getRevenue();
    }

    Page<MarketingCampaign> findByStatus(MarketingCampaignStatus status, Pageable pageable);

    @Query("""
            select c from MarketingCampaign c
            where c.status = com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus.SCHEDULED
              and c.sentAt is null
              and (c.scheduledAt is null or c.scheduledAt <= :now)
              and (c.nextRetryAt is null or c.nextRetryAt <= :now)
            order by c.dateCreation asc
            """)
    List<MarketingCampaign> findDueCampaigns(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("""
            select coalesce(sum(c.revenue), 0)
            from MarketingCampaign c
            where (:from is null or coalesce(c.dateCreation, c.createdAt) >= :from)
            """)
    Double sumRevenueFrom(@Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(c.budgetSpent), 0)
            from MarketingCampaign c
            where (:from is null or coalesce(c.dateCreation, c.createdAt) >= :from)
            """)
    Double sumBudgetFrom(@Param("from") LocalDateTime from);

    @Query("""
            select c.type as type, coalesce(sum(c.revenue), 0) as revenue
            from MarketingCampaign c
            where (:from is null or coalesce(c.dateCreation, c.createdAt) >= :from)
            group by c.type
            """)
    List<TypeRevenueAgg> revenueByTypeFrom(@Param("from") LocalDateTime from);
}
