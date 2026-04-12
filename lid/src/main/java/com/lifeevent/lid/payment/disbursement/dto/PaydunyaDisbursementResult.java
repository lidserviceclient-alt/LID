package com.lifeevent.lid.payment.disbursement.dto;

public record PaydunyaDisbursementResult(
        String disburseInvoice,
        String disburseId,
        String status,
        String responseCode,
        String responseText,
        String transactionId,
        String providerRef
) {
    public boolean success() {
        return "success".equalsIgnoreCase(status);
    }

    public boolean pending() {
        return "pending".equalsIgnoreCase(status) || "created".equalsIgnoreCase(status);
    }
}
