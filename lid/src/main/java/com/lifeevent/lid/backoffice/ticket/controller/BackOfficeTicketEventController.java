package com.lifeevent.lid.backoffice.ticket.controller;

import com.lifeevent.lid.backoffice.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.backoffice.ticket.service.BackOfficeTicketEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/back-office/tickets")
@RequiredArgsConstructor
public class BackOfficeTicketEventController implements IBackOfficeTicketEventController {

    private final BackOfficeTicketEventService backOfficeTicketEventService;

    @Override
    public ResponseEntity<Page<BackOfficeTicketEventDto>> getAll(int page, int size) {
        return ResponseEntity.ok(
                backOfficeTicketEventService.getAll(
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "eventDate"))
                )
        );
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
