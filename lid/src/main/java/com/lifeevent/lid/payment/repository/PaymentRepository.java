package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour les paiements
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByInvoiceToken(String invoiceToken);
    
    List<Payment> findByOrderId(Long orderId);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    List<Payment> findByCustomerEmail(String customerEmail);
    
    List<Payment> findByTransactionId(String transactionId);

    @Query("""
        SELECT COALESCE(SUM(COALESCE(p.amount, 0)), 0)
        FROM Payment p
        WHERE p.status = :status
    """)
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("""
        SELECT COALESCE(SUM(COALESCE(p.amount, 0)), 0)
        FROM Payment p
        WHERE p.status = :status
          AND COALESCE(p.paymentDate, p.createdAt) >= :from
    """)
    BigDecimal sumAmountByStatusFrom(
            @Param("status") PaymentStatus status,
            @Param("from") LocalDateTime from
    );
}
