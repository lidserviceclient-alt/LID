package com.lifeevent.lid.payment.partner.repository;

import com.lifeevent.lid.payment.partner.entity.PartnerSettlement;
import com.lifeevent.lid.payment.partner.entity.PartnerSettlementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface PartnerSettlementRepository extends JpaRepository<PartnerSettlement, Long> {

    interface PartnerTransactionView {
        Long getId();
        Long getOrderId();
        String getPartnerId();
        String getPartnerName();
        String getCurrency();
        BigDecimal getGrossAmount();
        BigDecimal getDiscountAllocation();
        BigDecimal getShippingAllocation();
        BigDecimal getReturnCostAllocation();
        BigDecimal getMarginPercent();
        BigDecimal getMarginAmount();
        BigDecimal getNetAmount();
        LocalDateTime getTransactionDate();
        LocalDateTime getEligibleAt();
        LocalDateTime getPaidOutAt();
        String getPayoutReference();
        PartnerSettlementStatus getPayoutStatus();
    }

    List<PartnerSettlement> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);

    void deleteByOrderIdAndPartnerIdNotIn(Long orderId, Collection<String> partnerIds);

    @Modifying
    @Query("""
        update PartnerSettlement s
           set s.payoutStatus = :eligibleStatus
         where s.payoutStatus = :pendingStatus
           and s.eligibleAt is not null
           and s.eligibleAt <= :now
    """)
    int promoteEligible(
            @Param("now") LocalDateTime now,
            @Param("pendingStatus") PartnerSettlementStatus pendingStatus,
            @Param("eligibleStatus") PartnerSettlementStatus eligibleStatus
    );

    @Query("""
        select s.id as id,
               s.orderId as orderId,
               s.partnerId as partnerId,
               s.partnerName as partnerName,
               s.currency as currency,
               s.grossAmount as grossAmount,
               s.discountAllocation as discountAllocation,
               s.shippingAllocation as shippingAllocation,
               s.returnCostAllocation as returnCostAllocation,
               s.marginPercent as marginPercent,
               s.marginAmount as marginAmount,
               s.netAmount as netAmount,
               s.transactionDate as transactionDate,
               s.eligibleAt as eligibleAt,
               s.paidOutAt as paidOutAt,
               s.payoutReference as payoutReference,
               s.payoutStatus as payoutStatus
          from PartnerSettlement s
         where s.partnerId = :partnerId
           and s.transactionDate >= :from
           and s.transactionDate < :to
         order by s.transactionDate desc, s.createdAt desc
    """)
    Page<PartnerTransactionView> findTransactionViews(
            @Param("partnerId") String partnerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    @Query("""
        select s.id as id,
               s.orderId as orderId,
               s.partnerId as partnerId,
               s.partnerName as partnerName,
               s.currency as currency,
               s.grossAmount as grossAmount,
               s.discountAllocation as discountAllocation,
               s.shippingAllocation as shippingAllocation,
               s.returnCostAllocation as returnCostAllocation,
               s.marginPercent as marginPercent,
               s.marginAmount as marginAmount,
               s.netAmount as netAmount,
               s.transactionDate as transactionDate,
               s.eligibleAt as eligibleAt,
               s.paidOutAt as paidOutAt,
               s.payoutReference as payoutReference,
               s.payoutStatus as payoutStatus
          from PartnerSettlement s
         where s.partnerId = :partnerId
           and s.transactionDate >= :from
           and s.transactionDate < :to
         order by s.transactionDate desc, s.createdAt desc
    """)
    List<PartnerTransactionView> findTransactionViews(
            @Param("partnerId") String partnerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
