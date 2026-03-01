package com.lifeevent.lid.backoffice.ticket.service;

import com.lifeevent.lid.backoffice.ticket.dto.BackOfficeTicketEventDto;

import java.util.List;

public interface BackOfficeTicketEventService {
    List<BackOfficeTicketEventDto> getAll();
    BackOfficeTicketEventDto getById(Long id);
    BackOfficeTicketEventDto create(BackOfficeTicketEventDto dto);
    BackOfficeTicketEventDto update(Long id, BackOfficeTicketEventDto dto);
    void delete(Long id);
}
