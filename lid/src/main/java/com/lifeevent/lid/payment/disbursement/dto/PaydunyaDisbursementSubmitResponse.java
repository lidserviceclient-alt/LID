package com.lifeevent.lid.payment.disbursement.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaydunyaDisbursementSubmitResponse(
        @JsonProperty("response_code")
        String responseCode,
        @JsonProperty("response_text")
        String responseText,
        String status,
        @JsonProperty("disburse_id")
        String disburseId,
        @JsonProperty("transaction_id")
        String transactionId,
        @JsonProperty("provider_ref")
        String providerRef
) {
}
