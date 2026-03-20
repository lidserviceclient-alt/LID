package com.lifeevent.lid.backoffice.partner.order.dto;

import com.lifeevent.lid.order.enumeration.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerOrderDetailDto {
    private Long id;
    private String trackingNumber;
    private Status status;
    private Double amount;
    private String currency;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;
    private List<PartnerOrderItemDto> items;
}

