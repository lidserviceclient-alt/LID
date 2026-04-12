package com.lifeevent.lid.payment.disbursement.service;

import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementResult;

import java.math.BigDecimal;

public interface PaydunyaDisbursementService {

    PaydunyaDisbursementResult disburse(String accountAlias, BigDecimal amount, String withdrawMode, String disburseId);
}
