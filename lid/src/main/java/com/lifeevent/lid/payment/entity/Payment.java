package com.lifeevent.lid.payment.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité représentant une transaction de paiement PayDunya
 */
@Entity
@Table(
        name = "payment",
        indexes = {
                @Index(name = "idx_payment_status_payment_date_created_at", columnList = "status, payment_date, created_at"),
                @Index(name = "idx_payment_order_id", columnList = "order_id"),
                @Index(name = "idx_payment_transaction_id", columnList = "transaction_id"),
                @Index(name = "idx_payment_customer_email", columnList = "customer_email")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class Payment extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Identifiant unique de la commande liée au paiement
     */
    private Long orderId;
    
    /**
     * Token de la facture PayDunya
     */
    private String invoiceToken;
    
    /**
     * Montant du paiement
     */
    private BigDecimal amount;
    
    /**
     * Devise (par défaut: XOF pour les pays africains)
     */
    @Column(columnDefinition = "VARCHAR(3) DEFAULT 'XOF'")
    private String currency = "XOF";
    
    /**
     * Description du paiement
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * Opérateur de paiement utilisé
     */
    @Enumerated(EnumType.STRING)
    private PaymentOperator operator;
    
    /**
     * État du paiement
     */
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PENDING'")
    private PaymentStatus status = PaymentStatus.PENDING;
    
    /**
     * Informations du client
     */
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    /**
     * URL pour le reçu de paiement (fourni par PayDunya)
     */
    private String receiptUrl;
    
    /**
     * URL de redirection après succès
     */
    private String returnUrl;
    
    /**
     * URL de redirection après annulation
     */
    private String cancelUrl;
    
    /**
     * Date du paiement effectif
     */
    private LocalDateTime paymentDate;
    
    /**
     * Raison d'échec (si applicable)
     */
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    /**
     * Référence de transaction PayDunya
     */
    private String transactionId;
    
    /**
     * Hash de sécurité fourni par PayDunya
     */
    private String paydunyaHash;
}
