package com.lifeevent.lid.content.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.content.dto.TicketEventDto;
import com.lifeevent.lid.content.entity.TicketEvent;
import com.lifeevent.lid.content.repository.TicketEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketEventService {
    private final TicketEventRepository repository;

    public TicketEventService(TicketEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TicketEventDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TicketEventDto get(String id) {
        TicketEvent event = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", id));
        return toDto(event);
    }

    @Transactional
    public TicketEventDto create(TicketEventDto dto) {
        TicketEvent event = new TicketEvent();
        apply(dto, event);
        return toDto(repository.save(event));
    }

    @Transactional
    public TicketEventDto update(String id, TicketEventDto dto) {
        TicketEvent event = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", id));
        apply(dto, event);
        return toDto(repository.save(event));
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("TicketEvent", "id", id);
        }
        repository.deleteById(id);
    }

    private void apply(TicketEventDto dto, TicketEvent event) {
        event.setTitle(dto.getTitle());
        event.setDate(dto.getDate());
        event.setLocation(dto.getLocation());
        event.setPrice(dto.getPrice());
        event.setImageUrl(dto.getImageUrl());
        event.setCategory(dto.getCategory());
        event.setAvailable(dto.getAvailable());
        event.setDescription(dto.getDescription());
    }

    private TicketEventDto toDto(TicketEvent event) {
        return TicketEventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .date(event.getDate())
                .location(event.getLocation())
                .price(event.getPrice())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .available(event.getAvailable())
                .description(event.getDescription())
                .build();
    }
}
