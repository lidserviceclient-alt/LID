package com.lifeevent.lid.logistics.service;

import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.entity.ShipmentStatusHistory;
import com.lifeevent.lid.logistics.enumeration.ShipmentHistorySource;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.logistics.repository.ShipmentStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ShipmentStatusTransitionService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository historyRepository;

    public Shipment create(Shipment shipment, String comment, ShipmentHistorySource source) {
        return saveWithHistory(shipment, null, shipment == null ? null : shipment.getStatus(), comment, source, null, null, true);
    }

    public Shipment transition(Shipment shipment, ShipmentStatus status, String comment, ShipmentHistorySource source) {
        return transition(shipment, status, comment, source, null, null);
    }

    public Shipment transition(Shipment shipment, ShipmentStatus status, String comment, ShipmentHistorySource source, String actorId, String actorLabel) {
        return saveWithHistory(shipment, null, status, comment, source, actorId, actorLabel, false);
    }

    public Shipment transitionFromPrevious(
            Shipment shipment,
            ShipmentStatus previousStatus,
            ShipmentStatus status,
            String comment,
            ShipmentHistorySource source
    ) {
        return saveWithHistory(shipment, previousStatus, status, comment, source, null, null, false);
    }

    public Shipment saveWithoutStatusHistory(Shipment shipment) {
        return shipmentRepository.save(shipment);
    }

    private Shipment saveWithHistory(
            Shipment shipment,
            ShipmentStatus previousStatusOverride,
            ShipmentStatus status,
            String comment,
            ShipmentHistorySource source,
            String actorId,
            String actorLabel,
            boolean forceHistory
    ) {
        if (shipment == null) {
            throw new IllegalArgumentException("Livraison requise");
        }
        if (status == null) {
            throw new IllegalArgumentException("Statut livraison requis");
        }

        ShipmentStatus previousStatus = previousStatusOverride == null ? shipment.getStatus() : previousStatusOverride;
        applyLifecycle(shipment, status);
        Shipment saved = shipmentRepository.save(shipment);
        if (forceHistory || !Objects.equals(previousStatus, status)) {
            appendHistory(saved, status, comment, source, actorId, actorLabel);
        }
        return saved;
    }

    private void applyLifecycle(Shipment shipment, ShipmentStatus status) {
        shipment.setStatus(status);
        if (status == ShipmentStatus.LIVREE) {
            if (shipment.getDeliveredAt() == null) {
                shipment.setDeliveredAt(LocalDateTime.now());
            }
            shipment.setCustomerFacingComment(null);
            return;
        }
        if (status == ShipmentStatus.EN_PREPARATION) {
            shipment.setCustomerFacingComment(null);
        }
        shipment.setDeliveredAt(null);
    }

    private void appendHistory(
            Shipment shipment,
            ShipmentStatus status,
            String comment,
            ShipmentHistorySource source,
            String actorId,
            String actorLabel
    ) {
        historyRepository.save(ShipmentStatusHistory.builder()
                .shipment(shipment)
                .status(status)
                .comment(trimToNull(comment))
                .source(source == null ? ShipmentHistorySource.SYSTEM : source)
                .actorId(trimToNull(actorId))
                .actorLabel(trimToNull(actorLabel))
                .changedAt(LocalDateTime.now())
                .build());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
