package com.lifeevent.lid.payment.disbursement.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaydunyaDisbursementInvoiceResponse(
        @JsonProperty("response_code")
        String responseCode,
        @JsonProperty("response_text")
        String responseText,
        @JsonProperty("disburse_token")
        String disburseToken
) {
}
