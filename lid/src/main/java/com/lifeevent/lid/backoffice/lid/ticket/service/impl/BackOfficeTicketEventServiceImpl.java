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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeTicketEventServiceImpl implements BackOfficeTicketEventService {

    private final TicketEventRepository ticketEventRepository;
    private final BackOfficeTicketEventMapper backOfficeTicketEventMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final TicketInventoryService ticketInventoryService;
    private static final double DEFAULT_PRICE_MARKUP_PERCENT = 2d;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeTicketEventDto> getAll(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        return ticketEventRepository
                .findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "eventDate")))
                .map(this::toDto);
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
        double basePrice = normalizePrice(entity.getBasePrice() != null ? entity.getBasePrice() : entity.getPrice());
        double markupPercent = normalizeMarkupPercent(entity.getPriceMarkupPercent());
        entity.setBasePrice(basePrice);
        entity.setPriceMarkupPercent(markupPercent);
        entity.setPrice(calculatePrice(basePrice, markupPercent));
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
        dto.setBasePrice(entity.getBasePrice() == null ? entity.getPrice() : entity.getBasePrice());
        dto.setPriceMarkupPercent(normalizeMarkupPercent(entity.getPriceMarkupPercent()));
        return dto;
    }

    private double normalizePrice(Double price) {
        if (price == null || !Double.isFinite(price) || price < 0d) {
            return 0d;
        }
        return price;
    }

    private double normalizeMarkupPercent(Double markupPercent) {
        if (markupPercent == null || !Double.isFinite(markupPercent) || markupPercent < 0d) {
            return DEFAULT_PRICE_MARKUP_PERCENT;
        }
        return markupPercent;
    }

    private double calculatePrice(double basePrice, double markupPercent) {
        return Math.round(basePrice * (1d + markupPercent / 100d));
    }
}
