package com.lifeevent.lid.backoffice.finance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeFinanceTransactionDto {
    private String id;
    private String type;
    private String method;
    private BigDecimal amount;
    private String status;
    private LocalDateTime date;
}
