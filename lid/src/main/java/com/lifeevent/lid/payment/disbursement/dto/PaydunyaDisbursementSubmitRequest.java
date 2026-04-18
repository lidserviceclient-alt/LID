package com.lifeevent.lid.payment.disbursement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaydunyaDisbursementSubmitRequest(
        @JsonProperty("disburse_invoice")
        String disburseInvoice,
        @JsonProperty("disburse_id")
        String disburseId
) {
}
