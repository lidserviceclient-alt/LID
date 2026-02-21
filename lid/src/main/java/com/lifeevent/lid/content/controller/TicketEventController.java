package com.lifeevent.lid.content.controller;

import com.lifeevent.lid.content.dto.TicketEventDto;
import com.lifeevent.lid.content.service.TicketEventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketEventController {
    private final TicketEventService service;

    public TicketEventController(TicketEventService service) {
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
}
