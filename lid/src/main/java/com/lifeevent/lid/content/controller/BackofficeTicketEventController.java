package com.lifeevent.lid.content.controller;

import com.lifeevent.lid.content.dto.TicketEventDto;
import com.lifeevent.lid.content.service.TicketEventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/tickets")
public class BackofficeTicketEventController {
    private final TicketEventService service;

    public BackofficeTicketEventController(TicketEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<TicketEventDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public TicketEventDto get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public TicketEventDto create(@RequestBody TicketEventDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public TicketEventDto update(@PathVariable String id, @RequestBody TicketEventDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
