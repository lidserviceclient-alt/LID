package com.lifeevent.lid.backoffice.order.dto;

import com.lifeevent.lid.backoffice.order.enumeration.BackOfficeOrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOrderSummaryDto {
    private Long id;
    private String customer;
    private Integer items;
    private Double total;
    private BackOfficeOrderStatus status;
    private LocalDateTime dateCreation;
}
