package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Refund;
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

    @Query("""
        SELECT COALESCE(SUM(COALESCE(r.amount, 0)), 0)
        FROM Refund r
        WHERE UPPER(r.status) = UPPER(:status)
          AND (
            :from IS NULL OR
            COALESCE(r.processedDate, r.createdAt) >= :from
          )
    """)
    BigDecimal sumAmountByStatusFrom(
            @Param("status") String status,
            @Param("from") LocalDateTime from
    );
}
