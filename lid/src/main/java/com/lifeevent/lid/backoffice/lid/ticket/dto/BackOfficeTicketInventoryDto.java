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
public class BackOfficeTicketInventoryDto {
    private Long ticketEventId;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer quantityTotal;
    private Boolean available;
    private Boolean sellable;
}
