package com.lifeevent.lid.backoffice.ticket.service;

import com.lifeevent.lid.backoffice.ticket.dto.BackOfficeTicketEventDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeTicketEventService {
    Page<BackOfficeTicketEventDto> getAll(Pageable pageable);
    BackOfficeTicketEventDto create(BackOfficeTicketEventDto dto);
    BackOfficeTicketEventDto update(Long id, BackOfficeTicketEventDto dto);
    void delete(Long id);
}
