package com.lifeevent.lid.backoffice.lid.ticket.controller;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketInventoryDto;
import com.lifeevent.lid.backoffice.lid.ticket.dto.AdjustTicketInventoryRequest;
import com.lifeevent.lid.backoffice.lid.ticket.service.BackOfficeTicketEventService;
import com.lifeevent.lid.ticket.service.TicketInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/tickets")
@RequiredArgsConstructor
public class BackOfficeTicketEventController implements IBackOfficeTicketEventController {

    private final BackOfficeTicketEventService backOfficeTicketEventService;
    private final TicketInventoryService ticketInventoryService;

    @Override
    public ResponseEntity<List<BackOfficeTicketEventDto>> getAll(int page, int size) {
        return ResponseEntity.ok(backOfficeTicketEventService.getAll(page, size));
    }

    @Override
    public ResponseEntity<BackOfficeTicketEventDto> getById(Long id) {
        return ResponseEntity.ok(backOfficeTicketEventService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeTicketEventDto> create(BackOfficeTicketEventDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeTicketEventService.create(dto));
    }

    @Override
    public ResponseEntity<BackOfficeTicketEventDto> update(Long id, BackOfficeTicketEventDto dto) {
        return ResponseEntity.ok(backOfficeTicketEventService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        backOfficeTicketEventService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BackOfficeTicketInventoryDto> getInventory(Long id) {
        return ResponseEntity.ok(ticketInventoryService.getInventory(id));
    }

    @Override
    public ResponseEntity<BackOfficeTicketInventoryDto> adjustInventory(Long id, AdjustTicketInventoryRequest request) {
        String mode = request == null || request.getMode() == null ? "" : request.getMode().trim().toUpperCase();
        int quantity = request == null || request.getQuantity() == null ? 0 : request.getQuantity();
        BackOfficeTicketInventoryDto response = switch (mode) {
            case "SET" -> ticketInventoryService.setAvailableQuantity(id, quantity);
            case "INCREMENT" -> ticketInventoryService.incrementAvailableQuantity(id, quantity);
            case "DECREMENT" -> ticketInventoryService.decrementAvailableQuantity(id, quantity);
            default -> throw new IllegalArgumentException("mode invalide");
        };
        return ResponseEntity.ok(response);
    }
}
