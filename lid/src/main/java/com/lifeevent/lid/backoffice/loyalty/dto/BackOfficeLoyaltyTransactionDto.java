package com.lifeevent.lid.backoffice.loyalty.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLoyaltyTransactionDto {
    private String id;
    private String type;
    private Integer points;
    private String reason;
    private String orderId;
    private LocalDateTime createdAt;
}
