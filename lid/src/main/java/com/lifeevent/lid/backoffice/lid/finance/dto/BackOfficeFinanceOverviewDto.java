package com.lifeevent.lid.backoffice.lid.finance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeFinanceOverviewDto {
    private BigDecimal availableBalance;
    private BigDecimal inflows;
    private BigDecimal outflows;
    private BigDecimal pending;
    private LocalDateTime updatedAt;
}
