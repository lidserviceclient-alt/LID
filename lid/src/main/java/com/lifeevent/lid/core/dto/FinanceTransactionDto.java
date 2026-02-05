package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FinanceTransactionDto(
        String id,
        String type,
        String method,
        BigDecimal amount,
        String status,
        LocalDateTime date
) {
}

