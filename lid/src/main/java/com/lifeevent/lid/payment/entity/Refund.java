package com.lifeevent.lid.payment.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité représentant un remboursement
 */
@Entity
@Table(name = "refunds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Refund extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Paiement associé au remboursement
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    
    /**
     * Montant remboursé
     */
    private BigDecimal amount;
    
    /**
     * Motif du remboursement
     */
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    /**
     * État du remboursement
     * PENDING, PROCESSING, COMPLETED, FAILED
     */
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PENDING'")
    private String status = "PENDING";
    
    /**
     * Date de traitement du remboursement
     */
    private LocalDateTime processedDate;
    
    /**
     * Référence de remboursement PayDunya
     */
    private String refundId;
}
