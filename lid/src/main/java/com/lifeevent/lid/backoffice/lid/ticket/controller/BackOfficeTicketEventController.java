package com.lifeevent.lid.backoffice.lid.ticket.controller;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.backoffice.lid.ticket.service.BackOfficeTicketEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/tickets", "/api/backoffice/tickets"})
@RequiredArgsConstructor
public class BackOfficeTicketEventController implements IBackOfficeTicketEventController {

    private final BackOfficeTicketEventService backOfficeTicketEventService;

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
}
