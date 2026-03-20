package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour les remboursements
 */
@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    
    List<Refund> findByPaymentId(Long paymentId);
    
    List<Refund> findByStatus(String status);
}
