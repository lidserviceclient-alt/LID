package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
