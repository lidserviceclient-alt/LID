package com.lifeevent.lid.payment.enums;

/**
 * État du paiement
 */
public enum PaymentStatus {
    PENDING("pending", "En attente"),
    COMPLETED("completed", "Complété"),
    CANCELLED("cancelled", "Annulé"),
    FAILED("failed", "Échoué"),
    REFUNDED("refunded", "Remboursé");
    
    private final String code;
    private final String label;
    
    PaymentStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getLabel() {
        return label;
    }
    
    public static PaymentStatus fromCode(String code) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return PENDING;
    }
}
