package com.lifeevent.lid.ticket.controller;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.ticket.dto.TicketEventDto;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketEventController {

    private final TicketEventRepository ticketEventRepository;

    @GetMapping
    @Cacheable(
            cacheNames = CatalogCacheNames.TICKETS,
            key = "@cacheScopeVersionService.ticketVersion() + ':' + #page + ':' + #size",
            sync = true
    )
    public List<TicketEventDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        List<TicketEvent> entities = ticketEventRepository
                .findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "eventDate")))
                .getContent();
        return entities.stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    @Cacheable(
            cacheNames = CatalogCacheNames.TICKET_DETAILS,
            key = "@cacheScopeVersionService.ticketVersion() + ':' + #id",
            sync = true
    )
    public TicketEventDto get(@PathVariable Long id) {
        TicketEvent entity = ticketEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", id.toString()));
        return toDto(entity);
    }

    private TicketEventDto toDto(TicketEvent entity) {
        return TicketEventDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .location(entity.getLocation())
                .date(entity.getEventDate())
                .eventDate(entity.getEventDate())
                .price(entity.getPrice())
                .imageUrl(entity.getImageUrl())
                .category(entity.getCategory())
                .available(entity.getAvailable())
                .build();
    }
}
