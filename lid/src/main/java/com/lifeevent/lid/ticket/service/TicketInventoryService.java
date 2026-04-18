package com.lifeevent.lid.ticket.service;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketInventoryDto;
import com.lifeevent.lid.ticket.entity.TicketEvent;

public interface TicketInventoryService {
    BackOfficeTicketInventoryDto getInventory(Long ticketEventId);
    BackOfficeTicketInventoryDto setAvailableQuantity(Long ticketEventId, int quantity);
    BackOfficeTicketInventoryDto incrementAvailableQuantity(Long ticketEventId, int quantity);
    BackOfficeTicketInventoryDto decrementAvailableQuantity(Long ticketEventId, int quantity);
    void reserve(Long ticketEventId, int quantity);
    void releaseReserved(Long ticketEventId, int quantity);
    void consumeReserved(Long ticketEventId, int quantity);
    boolean isSellable(TicketEvent ticketEvent);
}
