package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.MarketingCampaign;
import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, String> {

    Page<MarketingCampaign> findByStatus(MarketingCampaignStatus status, Pageable pageable);

    @Query("""
            select coalesce(sum(c.revenue), 0) from MarketingCampaign c
            where (:from is null or c.dateCreation >= :from)
            """)
    BigDecimal sumRevenueFrom(@Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(c.budgetSpent), 0) from MarketingCampaign c
            where (:from is null or c.dateCreation >= :from)
            """)
    BigDecimal sumBudgetFrom(@Param("from") LocalDateTime from);

    interface TypeRevenueAgg {
        MarketingCampaignType getType();

        BigDecimal getRevenue();
    }

    @Query("""
            select c.type as type, coalesce(sum(c.revenue), 0) as revenue
            from MarketingCampaign c
            where (:from is null or c.dateCreation >= :from)
            group by c.type
            """)
    List<TypeRevenueAgg> revenueByTypeFrom(@Param("from") LocalDateTime from);
}

