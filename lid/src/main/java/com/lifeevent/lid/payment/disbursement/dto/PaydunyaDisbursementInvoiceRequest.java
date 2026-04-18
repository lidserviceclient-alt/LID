package com.lifeevent.lid.payment.disbursement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PaydunyaDisbursementInvoiceRequest(
        @JsonProperty("account_alias")
        String accountAlias,
        long amount,
        @JsonProperty("withdraw_mode")
        String withdrawMode,
        @JsonProperty("callback_url")
        String callbackUrl
) {
}
