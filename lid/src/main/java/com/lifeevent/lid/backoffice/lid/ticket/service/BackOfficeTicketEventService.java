package com.lifeevent.lid.backoffice.lid.ticket.service;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketEventDto;
import org.springframework.data.domain.Page;

public interface BackOfficeTicketEventService {
    Page<BackOfficeTicketEventDto> getAll(int page, int size);
    BackOfficeTicketEventDto getById(Long id);
    BackOfficeTicketEventDto create(BackOfficeTicketEventDto dto);
    BackOfficeTicketEventDto update(Long id, BackOfficeTicketEventDto dto);
    void delete(Long id);
}
