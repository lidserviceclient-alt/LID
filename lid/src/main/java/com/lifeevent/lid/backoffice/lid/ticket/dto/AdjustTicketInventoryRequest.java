package com.lifeevent.lid.backoffice.lid.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjustTicketInventoryRequest {
    private String mode;
    private Integer quantity;
}
