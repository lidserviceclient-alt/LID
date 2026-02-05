package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Refund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour les remboursements
 */
@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    
    List<Refund> findByPaymentId(Long paymentId);
    
    List<Refund> findByStatus(String status);

    @Query("select r from Refund r order by coalesce(r.processedDate, r.createdAt) desc")
    Page<Refund> findLatest(Pageable pageable);

    @Query("""
            select coalesce(sum(r.amount), 0)
            from Refund r
            where r.status = :status
              and (:from is null or coalesce(r.processedDate, r.createdAt) >= :from)
            """)
    BigDecimal sumAmountByStatusSince(@Param("status") String status, @Param("from") LocalDateTime from);
}
