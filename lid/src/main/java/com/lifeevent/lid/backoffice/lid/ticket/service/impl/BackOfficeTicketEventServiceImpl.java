package com.lifeevent.lid.backoffice.lid.ticket.service.impl;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.backoffice.lid.ticket.mapper.BackOfficeTicketEventMapper;
import com.lifeevent.lid.backoffice.lid.ticket.service.BackOfficeTicketEventService;
import com.lifeevent.lid.common.cache.event.TicketCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import com.lifeevent.lid.ticket.service.TicketInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeTicketEventServiceImpl implements BackOfficeTicketEventService {

    private final TicketEventRepository ticketEventRepository;
    private final BackOfficeTicketEventMapper backOfficeTicketEventMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final TicketInventoryService ticketInventoryService;

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeTicketEventDto> getAll(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        List<TicketEvent> entities = ticketEventRepository
                .findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "eventDate")))
                .getContent();
        return entities.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeTicketEventDto getById(Long id) {
        return toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeTicketEventDto create(BackOfficeTicketEventDto dto) {
        TicketEvent entity = backOfficeTicketEventMapper.toEntity(dto);
        applyDefaults(entity);
        TicketEvent saved = ticketEventRepository.save(entity);
        eventPublisher.publishEvent(new TicketCatalogChangedEvent());
        return backOfficeTicketEventMapper.toDto(saved);
    }

    @Override
    public BackOfficeTicketEventDto update(Long id, BackOfficeTicketEventDto dto) {
        TicketEvent entity = findByIdOrThrow(id);
        backOfficeTicketEventMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);
        TicketEvent saved = ticketEventRepository.save(entity);
        eventPublisher.publishEvent(new TicketCatalogChangedEvent());
        return backOfficeTicketEventMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!ticketEventRepository.existsById(id)) {
            throw new ResourceNotFoundException("TicketEvent", "id", id.toString());
        }
        ticketEventRepository.deleteById(id);
        eventPublisher.publishEvent(new TicketCatalogChangedEvent());
    }

    private void applyDefaults(TicketEvent entity) {
        if (entity.getAvailable() == null) {
            entity.setAvailable(Boolean.TRUE);
        }
        if (entity.getQuantityAvailable() == null || entity.getQuantityAvailable() < 0) {
            entity.setQuantityAvailable(0);
        }
        if (entity.getQuantityReserved() == null || entity.getQuantityReserved() < 0) {
            entity.setQuantityReserved(0);
        }
    }

    private TicketEvent findByIdOrThrow(Long id) {
        return ticketEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", id.toString()));
    }

    private BackOfficeTicketEventDto toDto(TicketEvent entity) {
        BackOfficeTicketEventDto dto = backOfficeTicketEventMapper.toDto(entity);
        dto.setQuantityAvailable(entity.getQuantityAvailable());
        dto.setQuantityReserved(entity.getQuantityReserved());
        dto.setSellable(ticketInventoryService.isSellable(entity));
        return dto;
    }
}
