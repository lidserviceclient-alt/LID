package com.lifeevent.lid.ticket.service.impl;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketInventoryDto;
import com.lifeevent.lid.common.cache.event.TicketCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import com.lifeevent.lid.ticket.service.TicketInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class TicketInventoryServiceImpl implements TicketInventoryService {

    private final TicketEventRepository ticketEventRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public BackOfficeTicketInventoryDto getInventory(Long ticketEventId) {
        return toInventoryDto(findByIdOrThrow(ticketEventId));
    }

    @Override
    public BackOfficeTicketInventoryDto setAvailableQuantity(Long ticketEventId, int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        TicketEvent ticketEvent = ticketEventRepository.findByIdForUpdate(ticketEventId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId)));
        int reserved = safe(ticketEvent.getQuantityReserved());
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        ticketEvent.setQuantityAvailable(quantity);
        if (reserved < 0) {
            ticketEvent.setQuantityReserved(0);
        }
        TicketEvent saved = ticketEventRepository.save(ticketEvent);
        publishChange();
        return toInventoryDto(saved);
    }

    @Override
    public BackOfficeTicketInventoryDto incrementAvailableQuantity(Long ticketEventId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        TicketEvent ticketEvent = ticketEventRepository.findByIdForUpdate(ticketEventId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId)));
        ticketEvent.setQuantityAvailable(safe(ticketEvent.getQuantityAvailable()) + quantity);
        TicketEvent saved = ticketEventRepository.save(ticketEvent);
        publishChange();
        return toInventoryDto(saved);
    }

    @Override
    public BackOfficeTicketInventoryDto decrementAvailableQuantity(Long ticketEventId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        TicketEvent ticketEvent = ticketEventRepository.findByIdForUpdate(ticketEventId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId)));
        int next = safe(ticketEvent.getQuantityAvailable()) - quantity;
        if (next < 0) {
            throw new IllegalArgumentException("Stock disponible insuffisant");
        }
        ticketEvent.setQuantityAvailable(next);
        TicketEvent saved = ticketEventRepository.save(ticketEvent);
        publishChange();
        return toInventoryDto(saved);
    }

    @Override
    public void reserve(Long ticketEventId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        int updated = ticketEventRepository.reserveIfEnough(ticketEventId, quantity);
        if (updated == 0) {
            throw new IllegalArgumentException("Stock insuffisant pour le ticket " + ticketEventId);
        }
        publishChange();
    }

    @Override
    public void releaseReserved(Long ticketEventId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        int updated = ticketEventRepository.releaseReserved(ticketEventId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour annulation, ticket " + ticketEventId);
        }
        publishChange();
    }

    @Override
    public void consumeReserved(Long ticketEventId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity invalide");
        }
        int updated = ticketEventRepository.consumeReserved(ticketEventId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour confirmation de paiement, ticket " + ticketEventId);
        }
        publishChange();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSellable(TicketEvent ticketEvent) {
        return ticketEvent != null
                && Boolean.TRUE.equals(ticketEvent.getAvailable())
                && safe(ticketEvent.getQuantityAvailable()) > 0;
    }

    private TicketEvent findByIdOrThrow(Long ticketEventId) {
        return ticketEventRepository.findById(ticketEventId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId)));
    }

    private BackOfficeTicketInventoryDto toInventoryDto(TicketEvent ticketEvent) {
        int available = safe(ticketEvent.getQuantityAvailable());
        int reserved = safe(ticketEvent.getQuantityReserved());
        return BackOfficeTicketInventoryDto.builder()
                .ticketEventId(ticketEvent.getId())
                .quantityAvailable(available)
                .quantityReserved(reserved)
                .quantityTotal(available + reserved)
                .available(Boolean.TRUE.equals(ticketEvent.getAvailable()))
                .sellable(isSellable(ticketEvent))
                .build();
    }

    private int safe(Integer value) {
        return value == null ? 0 : Math.max(0, value);
    }

    private void publishChange() {
        eventPublisher.publishEvent(new TicketCatalogChangedEvent());
    }
}
