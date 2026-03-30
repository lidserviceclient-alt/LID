package com.lifeevent.lid.payment.repository;

import com.lifeevent.lid.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository pour l'historique des transactions de paiement
 */
@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    List<PaymentTransaction> findByPaymentId(Long paymentId);
    
    List<PaymentTransaction> findByTransactionType(String transactionType);

    Optional<PaymentTransaction> findTopByPaymentIdAndTransactionTypeAndStatusAtTimeAndSourceOrderByCreatedAtDesc(
            Long paymentId,
            String transactionType,
            String statusAtTime,
            String source
    );
}
