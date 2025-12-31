package com.lifeevent.lid.payment.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entité pour tracker l'historique des paiements (audit)
 */
@Entity
@Table(name = "payment_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentTransaction extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Paiement associé
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    
    /**
     * Type de transaction
     * CREATION, CONFIRMATION, CANCELLATION, REFUND, WEBHOOK_RECEIVED
     */
    @Column(nullable = false)
    private String transactionType;
    
    /**
     * Statut lors de la transaction
     */
    private String statusAtTime;
    
    /**
     * Détails supplémentaires (JSON ou texte)
     */
    @Column(columnDefinition = "TEXT")
    private String details;
    
    /**
     * Source de la transaction (API, WEBHOOK, MANUAL)
     */
    private String source;
}
