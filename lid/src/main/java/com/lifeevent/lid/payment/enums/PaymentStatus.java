package com.lifeevent.lid.payment.enums;

import java.util.Locale;

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
        if (code == null) {
            return PENDING;
        }

        String normalized = code.trim();
        if (normalized.isBlank()) {
            return PENDING;
        }

        String lower = normalized.toLowerCase(Locale.ROOT);

        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.code.equals(lower) || status.name().equalsIgnoreCase(lower)) {
                return status;
            }
        }

        // Variants (PayDunya/interop)
        if ("canceled".equals(lower) || "cancelled".equals(lower)) {
            return CANCELLED;
        }
        if ("success".equals(lower) || "succeeded".equals(lower) || "paid".equals(lower)) {
            return COMPLETED;
        }
        if ("error".equals(lower)) {
            return FAILED;
        }

        return PENDING;
    }
}
