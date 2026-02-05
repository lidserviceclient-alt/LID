package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("select p from Payment p order by coalesce(p.paymentDate, p.createdAt) desc")
    Page<Payment> findLatest(Pageable pageable);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from Payment p
            where p.status = :status
              and (:from is null or coalesce(p.paymentDate, p.createdAt) >= :from)
            """)
    BigDecimal sumAmountByStatusSince(@Param("status") PaymentStatus status, @Param("from") LocalDateTime from);
}
