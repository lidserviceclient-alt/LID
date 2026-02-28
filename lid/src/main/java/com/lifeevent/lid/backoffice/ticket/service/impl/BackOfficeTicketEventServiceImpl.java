package com.lifeevent.lid.backoffice.ticket.service.impl;

import com.lifeevent.lid.backoffice.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.backoffice.ticket.mapper.BackOfficeTicketEventMapper;
import com.lifeevent.lid.backoffice.ticket.service.BackOfficeTicketEventService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeTicketEventServiceImpl implements BackOfficeTicketEventService {

    private final TicketEventRepository ticketEventRepository;
    private final BackOfficeTicketEventMapper backOfficeTicketEventMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeTicketEventDto> getAll(Pageable pageable) {
        return ticketEventRepository.findAll(pageable).map(backOfficeTicketEventMapper::toDto);
    }

    @Override
    public BackOfficeTicketEventDto create(BackOfficeTicketEventDto dto) {
        TicketEvent entity = backOfficeTicketEventMapper.toEntity(dto);
        applyDefaults(entity);
        TicketEvent saved = ticketEventRepository.save(entity);
        return backOfficeTicketEventMapper.toDto(saved);
    }

    @Override
    public BackOfficeTicketEventDto update(Long id, BackOfficeTicketEventDto dto) {
        TicketEvent entity = ticketEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", id.toString()));
        backOfficeTicketEventMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);
        TicketEvent saved = ticketEventRepository.save(entity);
        return backOfficeTicketEventMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!ticketEventRepository.existsById(id)) {
            throw new ResourceNotFoundException("TicketEvent", "id", id.toString());
        }
        ticketEventRepository.deleteById(id);
    }

    private void applyDefaults(TicketEvent entity) {
        if (entity.getAvailable() == null) {
            entity.setAvailable(Boolean.TRUE);
        }
    }
}
